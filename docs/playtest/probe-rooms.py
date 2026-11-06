"""Room-by-room probe: replay the walkthrough to each room's first arrival, then try one
command per fresh game. Usage: python docs/playtest/probe-rooms.py [step ...]
Writes runs/probes.json beside this file (git-ignored scratch output)."""
import json, subprocess, sys, re
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

GAME = Path(__file__).resolve().parents[2]
OUT = Path(__file__).parent / "runs"
OUT.mkdir(exist_ok=True)
WALK = (GAME / "walkthrough.txt").read_text().splitlines()

# (room, number of walkthrough lines that bring you there, probes)
ROOMS = [
    ("Tug Cargo Hold", 0, ["inventory", "examine me", "examine strobe", "examine alarm", "listen", "examine containers",
        "sleep", "eat ration bar", "read manifest", "aft", "turn off flashlight", "hint", "help", "exits"]),
    ("Tug Cockpit", 3, ["turn off alarm", "hit button", "push red button", "sit in seat", "look through viewport",
        "examine freighter", "examine hull", "dock", "brake", "use comms", "examine hatch", "south", "fly ship"]),
    ("Airlock", 47, ["examine claw marks", "examine door frame", "examine decals", "examine lighting", "listen",
        "smell", "north", "fore", "open inner door", "examine tug", "wait", "aft"]),
    ("Forward Corridor", 56, ["examine overhead panels", "examine floor plates", "smell", "lift panel",
        "look under panel", "examine conduit", "follow conduit", "starboard", "port", "aft", "close panels", "listen"]),
    ("Lower Mid Corridor", 60, ["examine directions", "read walls", "examine ladder", "climb ladder", "examine hatch",
        "call elevator", "fix elevator", "enter elevator", "examine shaft", "fore", "examine cable"]),
    ("Aft Corridor", 63, ["examine deck plates", "touch deck", "listen", "smell", "down", "south", "wait",
        "examine walls", "aft", "east", "west"]),
    ("Engine Room", 64, ["examine pipes", "examine valves", "examine tool rack", "listen", "talk to reed",
        "hello reed", "ask reed about ship", "ask reed about tug", "ask reed about crew", "take all",
        "examine reactor", "turn valve", "give ration bar to reed"]),
    ("Central Junction", 80, ["examine logo", "examine lis", "talk to lis", "hello lis", "ask lis about soms",
        "read wayfinding", "port", "starboard", "examine walls", "down", "follow lis"]),
    ("Upper Corridor", 84, ["examine pipes", "examine conduit", "examine bridge door", "open bridge door", "north",
        "knock on door", "fore", "east", "south", "listen", "unlock bridge door"]),
    ("Captain's Cabin", 85, ["examine photographs", "examine book", "read book", "examine flowers", "smell flowers",
        "examine vase", "search desk", "open drawer", "unlock desk", "pry desk", "take photographs",
        "read journal", "examine lock"]),
    ("Bridge", 102, ["examine console", "sit in chair", "examine stars", "examine screens", "use console",
        "launch pod", "enter pod", "override panel", "talk to soms", "call for help", "examine captain's chair",
        "read screens"]),
    ("Crew Bunks", 112, ["examine pods", "examine gouges", "examine mattress", "examine stains", "sleep",
        "search pods", "wear eva suit", "take baton", "examine wall", "look under mattress", "aft"]),
    ("Common Area", 117, ["talk to vasik", "hello vasik", "ask vasik about ship", "ask vasik about soms",
        "examine furniture", "move furniture", "examine card game", "play cards", "examine viewport",
        "examine table", "south", "attack vasik", "starboard"]),
    ("Lab Corridor", 124, ["examine panels", "examine lights", "smell", "examine walls", "look", "listen",
        "west", "south", "port"]),
    ("Science Lab", 125, ["examine workbenches", "examine equipment", "examine sample containers", "open cabinet",
        "take samples", "examine terminal", "use terminal", "examine instruments", "search benches",
        "read terminal", "examine cabinet"]),
    ("Medbay", 127, ["examine beds", "examine restraints", "examine quarantine cell", "enter cell",
        "examine cell door", "take medkit", "use medkit", "lie on bed", "search", "close cell door", "smell"]),
    ("Hab Corridor", 132, ["examine bulletin board", "examine photographs", "take photographs", "talk to lis",
        "ask lis about crew", "ask lis about soms", "examine lis", "south", "east", "starboard", "look"]),
    ("Mess Hall", 133, ["examine tables", "examine trays", "examine food fabrication unit", "examine fabricator",
        "examine posters", "read posters", "use fabricator", "take tray", "eat", "search tables", "turn on fabricator"]),
    ("Library", 137, ["examine terminals", "use terminal", "talk to soms", "ask soms about crew", "hello",
        "sit in chair", "examine chair", "read archive", "search archive", "examine screens", "ask soms about captain"]),
    ("Maintenance Shaft", 151, ["examine cables", "examine fiber", "cut cables", "cut cables with snips",
        "touch cables", "listen", "examine bundles", "follow cables", "west", "smell", "examine bulkhead"]),
    ("Cargo Bay", 154, ["talk to okafor", "hello okafor", "ask okafor about code", "ask okafor about camp",
        "examine containers", "examine ceiling", "examine bulkhead", "unlock bulkhead", "examine barricade",
        "east", "attack okafor", "south"]),
    ("Storage Annex", 215, ["examine shelving", "examine shelves", "examine yellow suit", "examine hook",
        "take suit", "wear hazmat suit", "examine elevator parts", "examine fabricator parts", "take all",
        "search shelves", "west"]),
]

SHARPEE = str(GAME / "node_modules" / ".bin" / "sharpee.cmd")

def play(cmds):
    inp = "\n".join(cmds + ["/quit"]) + "\n"
    r = subprocess.run([SHARPEE, "play"], input=inp.encode("utf-8"), capture_output=True,
                       cwd=GAME, timeout=600, shell=False)
    try:
        return r.stdout.decode("utf-8")
    except UnicodeDecodeError:
        return r.stdout.decode("cp1252", errors="replace")

def blocks(text):
    """Split play output into [(command, response)]; command None = boot text."""
    text = text.split("--- Play Mode ---", 1)[-1]
    text = text.split("\n", 1)[1] if "\n" in text else text
    out, cmd, buf = [], None, []
    for line in text.splitlines():
        m = re.match(r"^> (.*)$", line)
        if m:
            out.append((cmd, "\n".join(buf).strip()))
            cmd, buf = m.group(1), []
        else:
            buf.append(line)
    out.append((cmd, "\n".join(buf).strip()))
    return [(c, r.replace("[exited with code 0]", "").strip()) for c, r in out]

def job(args):
    i, room, n, probe = args
    prefix = WALK[:n]
    b = blocks(play(prefix + ([probe] if probe else [])))
    return i, room, probe, b

def main():
    only = set(sys.argv[1:])
    jobs = []
    for i, (room, n, probes) in enumerate(ROOMS):
        if only and str(i + 1) not in only:
            continue
        jobs.append((i, room, n, None))
        for p in probes:
            jobs.append((i, room, n, p))
    results = {}
    with ThreadPoolExecutor(6) as ex:
        for i, room, probe, b in ex.map(job, jobs):
            r = results.setdefault(i, {"room": room, "n": ROOMS[i][1], "probes": []})
            if probe is None:
                r["arrival"] = b[-1][1] if ROOMS[i][1] else b[0][1]
                r["arrival_cmd"] = b[-1][0] if ROOMS[i][1] else None
            else:
                r["probes"].append({"cmd": probe, "out": b[-1][1]})
            print(f"done {i+1} {room} :: {probe}", flush=True)
    path = OUT / ("probes.json" if not only else f"probes-{'-'.join(sorted(only))}.json")
    path.write_text(json.dumps([results[k] for k in sorted(results)], indent=1, ensure_ascii=False), encoding="utf-8")
    print("wrote", path)

if __name__ == "__main__":
    main()
