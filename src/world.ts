/**
 * No Signal Home — World Creation
 *
 * Factory functions for rooms, items, and scenery across 3 decks / 25 rooms.
 */

import {
  WorldModel,
  IFEntity,
  EntityType,
  Direction,
  IdentityTrait,
  RoomTrait,
  ContainerTrait,
  OpenableTrait,
  LockableTrait,
  SceneryTrait,
  SupporterTrait,
  ReadableTrait,
  DoorTrait,
  SwitchableTrait,
  LightSourceTrait,
} from '@sharpee/world-model';
import {
  RoomIds, ItemIds, RegionIds, Regions,
  ShipPropTrait, TerminalTrait, HazardTrait, MemoryTrait,
} from './types';

// ============================================================================
// SCENERY HELPERS
// ============================================================================

const sceneryIds: Record<string, string> = {};

export function getSceneryId(propId: string): string {
  return sceneryIds[propId];
}

function createSceneryEntity(
  world: WorldModel,
  name: string,
  locationId: string,
  description: string,
  opts: {
    aliases?: string[];
    adjectives?: string[];
    article?: string;
    propId?: string;
    grammaticalNumber?: 'singular' | 'plural';
  } = {},
): IFEntity {
  const entity = world.createEntity(name, EntityType.ITEM);
  entity.add(new IdentityTrait({
    name,
    description,
    aliases: opts.aliases || [],
    adjectives: opts.adjectives || [],
    article: opts.article || 'a',
    grammaticalNumber: opts.grammaticalNumber,
    properName: false,
  }));
  entity.add(new SceneryTrait({ mentioned: false, visible: true }));
  if (opts.propId) {
    entity.add(new ShipPropTrait(opts.propId));
    sceneryIds[opts.propId] = entity.id;
  }
  world.moveEntity(entity.id, locationId);
  return entity;
}

// ============================================================================
// REGIONS — 4 geographic areas (the tug + 3 decks of The Stillwater)
// ============================================================================

export function createRegions(world: WorldModel): RegionIds {
  world.createRegion(Regions.TUG, {
    name: 'The Tug',
  });
  world.createRegion(Regions.LOWER_DECK, {
    name: 'The Stillwater — Lower Deck',
  });
  world.createRegion(Regions.MID_DECK, {
    name: 'The Stillwater — Mid Deck',
  });
  world.createRegion(Regions.UPPER_DECK, {
    name: 'The Stillwater — Upper Deck',
  });
  return {
    tug: Regions.TUG,
    lowerDeck: Regions.LOWER_DECK,
    midDeck: Regions.MID_DECK,
    upperDeck: Regions.UPPER_DECK,
  };
}

// ============================================================================
// ROOMS — 26 rooms, the tug + 3 decks of The Stillwater
// ============================================================================

export function createRooms(world: WorldModel): RoomIds {
  // ----- TUG (2 rooms) -----

  const tugCargoHold = world.createEntity('Tug Cargo Hold', EntityType.ROOM);
  tugCargoHold.add(new IdentityTrait({
    name: 'Tug Cargo Hold',
    description: "Dark — but a strobing red light pulses from somewhere aft. Cold. You've been sleeping in the gap between two shipping containers. A proximity alarm screams from the cockpit, aft of here.",
    properName: true,
  }));
  tugCargoHold.add(new RoomTrait());

  const tugCockpit = world.createEntity('Tug Cockpit', EntityType.ROOM);
  tugCockpit.add(new IdentityTrait({
    name: 'Tug Cockpit',
    description: 'A cramped cockpit. Instruments flash amber — the proximity alarm fills the space with noise. Through the viewport, something massive and dark. Your fuel gauge reads three percent.',
    properName: true,
  }));
  tugCockpit.add(new RoomTrait());

  // ----- LOWER DECK (12 rooms) -----

  const airlock = world.createEntity('Airlock', EntityType.ROOM);
  airlock.add(new IdentityTrait({
    name: 'Airlock',
    description: 'A cylindrical airlock chamber connecting the tug to The Stillwater. Biohazard warning decals peel from the inner hull. Emergency lighting casts everything in pale amber. The tug is fore. The ship corridor stretches aft.',
    properName: true,
  }));
  airlock.add(new RoomTrait());

  const forwardCorridor = world.createEntity('Forward Corridor', EntityType.ROOM);
  forwardCorridor.add(new IdentityTrait({
    name: 'Forward Corridor',
    description: 'A long corridor running through the bow of The Stillwater. Overhead pipes drip condensation. The air smells of machine oil and something faintly chemical. The airlock is fore. The corridor continues aft toward the cargo bay. A maintenance hatch opens to starboard.',
    properName: true,
  }));
  forwardCorridor.add(new RoomTrait());

  const maintenanceShaft = world.createEntity('Maintenance Shaft', EntityType.ROOM);
  maintenanceShaft.add(new IdentityTrait({
    name: 'Maintenance Shaft',
    description: 'A narrow cable conduit running between decks. Bundles of fiber-optic cable snake along the walls. The air is stale and close. Your flashlight picks out junction boxes bolted to the bulkhead. The corridor is to port. The shaft continues aft to engineering.',
    properName: true,
  }));
  maintenanceShaft.add(new RoomTrait({ isDark: true }));

  const cargoBay = world.createEntity('Cargo Bay', EntityType.ROOM);
  cargoBay.add(new IdentityTrait({
    name: 'Cargo Bay',
    description: 'A cavernous cargo bay with high ceilings lost in shadow. Shipping containers stand in rows, some pried open. Someone has made a camp here — improvised bedding, a makeshift barricade of crates. The corridor is fore. A sealed bulkhead leads aft to the cargo hold. Storage is to starboard.',
    properName: true,
  }));
  cargoBay.add(new RoomTrait());

  const cargoHold = world.createEntity('Cargo Hold', EntityType.ROOM);
  cargoHold.add(new IdentityTrait({
    name: 'Cargo Hold',
    description: 'The deep cargo hold. Warning labels cover every surface. Rows of sealed transport containers fill the space, stamped with Meridian Solutions logos and biohazard symbols. The air tastes wrong — metallic, with something organic underneath. The cargo bay is fore.',
    properName: true,
  }));
  cargoHold.add(new RoomTrait());

  const storageAnnex = world.createEntity('Storage Annex', EntityType.ROOM);
  storageAnnex.add(new IdentityTrait({
    name: 'Storage Annex',
    description: 'A supply room lined with industrial shelving. Spare parts, sealed ration containers, and maintenance equipment fill the racks. A yellow hazmat suit hangs from a hook near the door. The cargo bay is to port.',
    properName: true,
  }));
  storageAnnex.add(new RoomTrait());

  const lowerMidCorridor = world.createEntity('Lower Mid Corridor', EntityType.ROOM);
  lowerMidCorridor.add(new IdentityTrait({
    name: 'Lower Mid Corridor',
    description: 'A junction point where the forward and aft sections meet. Direction signs point fore and aft, their corporate fonts cheerful against the grimy walls. A ladder leads up through a ceiling hatch. The corridor runs fore and aft. An elevator alcove opens to starboard.',
    properName: true,
  }));
  lowerMidCorridor.add(new RoomTrait());

  const cryoBay = world.createEntity('Cryo Bay', EntityType.ROOM);
  cryoBay.add(new IdentityTrait({
    name: 'Cryo Bay',
    description: 'Rows upon rows of cryo pods stretch into the gloom, stacked three high. Status lights blink — green, amber, red, dark. Hundreds of people frozen in here. Some pods have leaked fluid that has pooled on the deck. A chemical haze hangs in the air. Cryo control is aft.',
    properName: true,
  }));
  cryoBay.add(new RoomTrait({ isDark: true }));

  const cryoControl = world.createEntity('Cryo Control', EntityType.ROOM);
  cryoControl.add(new IdentityTrait({
    name: 'Cryo Control',
    description: 'A control room with a wide observation window overlooking the cryo bay. Banks of monitors display pod status — too many amber and red indicators. A control console offers selective thaw and emergency purge options. The cryo bay is fore.',
    properName: true,
  }));
  cryoControl.add(new RoomTrait());

  const aftCorridor = world.createEntity('Aft Corridor', EntityType.ROOM);
  aftCorridor.add(new IdentityTrait({
    name: 'Aft Corridor',
    description: 'The corridor narrows toward the stern. The deck plates are warm underfoot. A low thrum vibrates through the walls — the reactor, waking up. Engineering is aft. The mid corridor is fore.',
    properName: true,
  }));
  aftCorridor.add(new RoomTrait());

  const engineering = world.createEntity('Engineering', EntityType.ROOM);
  engineering.add(new IdentityTrait({
    name: 'Engineering',
    description: 'The engineering section. Heavy machinery fills the space — power conduits, coolant pipes, switching panels. A tool rack hangs on the far wall. A comms relay unit is bolted beside the main console. The reactor room is to starboard. The aft corridor is fore. The maintenance shaft opens forward to port.',
    properName: true,
  }));
  engineering.add(new RoomTrait());

  const reactorRoom = world.createEntity('Reactor Room', EntityType.ROOM);
  reactorRoom.add(new IdentityTrait({
    name: 'Reactor Room',
    description: 'The reactor chamber. Heat radiates from the central core. Warning indicators flash across the containment display. Radiation shielding panels line the walls but some have buckled. Without protection, you should not stay long. Engineering is to port.',
    properName: true,
  }));
  reactorRoom.add(new RoomTrait());

  // ----- MID DECK (7 rooms) -----

  const centralJunction = world.createEntity('Central Junction', EntityType.ROOM);
  centralJunction.add(new IdentityTrait({
    name: 'Central Junction',
    description: 'A wide junction where the mid deck splits into two wings. Corporate signage directs crew to port for labs and medical, starboard for habitation. A Meridian Solutions poster reads: "People First. Profit Always." Ladders lead up and down.',
    properName: true,
  }));
  centralJunction.add(new RoomTrait());

  const labCorridor = world.createEntity('Lab Corridor', EntityType.ROOM);
  labCorridor.add(new IdentityTrait({
    name: 'Lab Corridor',
    description: 'A corridor that was once sterile white, now streaked with grime. An old chemical spill has dried to a dark stain on the deck. A safety station with eye wash and gloves sits beside the door. The junction is to starboard. The science lab is to port. Medbay is aft.',
    properName: true,
  }));
  labCorridor.add(new RoomTrait());

  const scienceLab = world.createEntity('Science Lab', EntityType.ROOM);
  scienceLab.add(new IdentityTrait({
    name: 'Science Lab',
    description: 'Workbenches cluttered with broken equipment — a centrifuge tipped on its side, an analyzer with a cracked display. Sealed sample containers line one shelf. A research terminal flickers in the corner, its screen half-corrupted. The corridor is to starboard.',
    properName: true,
  }));
  scienceLab.add(new RoomTrait());

  const medbay = world.createEntity('Medbay', EntityType.ROOM);
  medbay.add(new IdentityTrait({
    name: 'Medbay',
    description: 'A medical facility with treatment beds and overhead surgical lights, all dead. A quarantine cell stands in the corner — its door bent outward from inside. Medical supply cabinets line the wall, most ransacked. The lab corridor is fore.',
    properName: true,
  }));
  medbay.add(new RoomTrait());

  const habCorridor = world.createEntity('Hab Corridor', EntityType.ROOM);
  habCorridor.add(new IdentityTrait({
    name: 'Hab Corridor',
    description: 'The habitation wing. Warmer here, more human. Crew photos line the wall in mismatched frames. A bulletin board holds shift schedules and personal notices — one reads "DO NOT TRUST THE SYSTEM" in hasty marker. The junction is to port. The mess hall is to starboard. The library is aft.',
    properName: true,
  }));
  habCorridor.add(new RoomTrait());

  const messHall = world.createEntity('Mess Hall', EntityType.ROOM);
  messHall.add(new IdentityTrait({
    name: 'Mess Hall',
    description: 'Long tables bolted to the deck. A food fabrication unit sits against the far wall, dark and silent. Corporate propaganda posters decorate every surface. Coffee mugs with crew names sit abandoned. The hab corridor is to port.',
    properName: true,
  }));
  messHall.add(new RoomTrait());

  const library = world.createEntity('Library', EntityType.ROOM);
  library.add(new IdentityTrait({
    name: 'Library',
    description: 'The ship\'s data archive. Racks of physical media storage — data crystals, backup drives — fill metal shelving. A comfortable reading chair faces a large terminal display. This feels like the ship\'s memory. The hab corridor is fore.',
    properName: true,
  }));
  library.add(new RoomTrait());

  // ----- UPPER DECK (5 rooms) -----

  const upperCorridor = world.createEntity('Upper Corridor', EntityType.ROOM);
  upperCorridor.add(new IdentityTrait({
    name: 'Upper Corridor',
    description: 'A narrow corridor with a low ceiling — submarine-tight. Ship schematics are posted behind scratched plexiglass. An intercom panel is mounted by the ladder. Crew bunks are aft. The captain\'s cabin is to starboard. The bridge is fore, behind a heavy security door.',
    properName: true,
  }));
  upperCorridor.add(new RoomTrait());

  const crewBunks = world.createEntity('Crew Bunks', EntityType.ROOM);
  crewBunks.add(new IdentityTrait({
    name: 'Crew Bunks',
    description: 'Stacked sleeping pods, four high. Most are stripped bare. One bunk has deep scratches gouged into the wall beside it. Dark stains on the mattress. A security rack holds equipment near the door. EVA suit storage is recessed into the far wall. The corridor is fore. The common area is aft.',
    properName: true,
  }));
  crewBunks.add(new RoomTrait());

  const commonArea = world.createEntity('Common Area', EntityType.ROOM);
  commonArea.add(new IdentityTrait({
    name: 'Common Area',
    description: 'A cramped recreation space. A viewport looks out into black nothing. Someone has built a barricade from furniture and deck plates across the starboard side of the room. A half-finished card game is scattered on a table. An air vent grille is set into the ceiling. The crew bunks are fore.',
    properName: true,
  }));
  commonArea.add(new RoomTrait());

  const captainsCabin = world.createEntity("Captain's Cabin", EntityType.ROOM);
  captainsCabin.add(new IdentityTrait({
    name: "Captain's Cabin",
    description: 'Modest quarters. Personal effects — framed photos, a half-read book, dried flowers in a vase. A locked desk sits against the bulkhead. The corridor is to port.',
    properName: true,
  }));
  captainsCabin.add(new RoomTrait());

  const bridge = world.createEntity('Bridge', EntityType.ROOM);
  bridge.add(new IdentityTrait({
    name: 'Bridge',
    description: 'The nerve center of The Stillwater. A navigation console dominates the forward wall, showing a star chart with a blinking destination marker. A comms array control panel sits beside it. The captain\'s log terminal glows dimly. A security override panel is mounted near the door. The corridor is aft.',
    properName: true,
  }));
  bridge.add(new RoomTrait());

  // ----- ROOM CONNECTIONS -----

  // Tug
  world.connectRooms(tugCargoHold.id, tugCockpit.id, Direction.SOUTH);

  // Lower Deck — cockpit to airlock starts disconnected (sealed until docking complete)
  // world.connectRooms(tugCockpit.id, airlock.id, Direction.SOUTH); -- wired dynamically by docking state
  world.connectRooms(airlock.id, forwardCorridor.id, Direction.SOUTH);
  world.connectRooms(forwardCorridor.id, cargoBay.id, Direction.SOUTH);
  world.connectRooms(forwardCorridor.id, maintenanceShaft.id, Direction.EAST);
  world.connectRooms(cargoBay.id, storageAnnex.id, Direction.EAST);
  // Cargo Hold — gated, connected but locked door
  // (connection wired manually via door below)
  world.connectRooms(forwardCorridor.id, lowerMidCorridor.id, Direction.WEST);
  world.connectRooms(lowerMidCorridor.id, aftCorridor.id, Direction.SOUTH);
  world.connectRooms(aftCorridor.id, engineering.id, Direction.SOUTH);
  world.connectRooms(engineering.id, reactorRoom.id, Direction.EAST);
  // Maintenance shaft shortcut to engineering (one-way: shaft→engineering only)
  // Cannot use connectRooms (bidirectional) — it would overwrite engineering NORTH→aftCorridor
  maintenanceShaft.get(RoomTrait)!.exits[Direction.SOUTH] = { destination: engineering.id };
  // Cryo Bay — gated behind elevator
  world.connectRooms(cryoBay.id, cryoControl.id, Direction.SOUTH);

  // Lower → Mid Deck (ladder)
  world.connectRooms(lowerMidCorridor.id, centralJunction.id, Direction.UP);

  // Mid Deck
  world.connectRooms(centralJunction.id, labCorridor.id, Direction.WEST);
  world.connectRooms(centralJunction.id, habCorridor.id, Direction.EAST);
  world.connectRooms(labCorridor.id, scienceLab.id, Direction.WEST);
  world.connectRooms(labCorridor.id, medbay.id, Direction.SOUTH);
  world.connectRooms(habCorridor.id, messHall.id, Direction.EAST);
  world.connectRooms(habCorridor.id, library.id, Direction.SOUTH);

  // Mid → Upper Deck (ladder)
  world.connectRooms(centralJunction.id, upperCorridor.id, Direction.UP);

  // Upper Deck
  world.connectRooms(upperCorridor.id, crewBunks.id, Direction.SOUTH);
  world.connectRooms(crewBunks.id, commonArea.id, Direction.SOUTH);
  world.connectRooms(upperCorridor.id, captainsCabin.id, Direction.EAST);
  // Bridge — gated by keycard (connected via door below)

  // ----- REGION ASSIGNMENTS -----
  // Tug (player's own ship)
  world.assignRoom(tugCargoHold.id, Regions.TUG);
  world.assignRoom(tugCockpit.id, Regions.TUG);
  // Lower Deck of The Stillwater — airlock is the boarding threshold
  world.assignRoom(airlock.id, Regions.LOWER_DECK);
  world.assignRoom(forwardCorridor.id, Regions.LOWER_DECK);
  world.assignRoom(maintenanceShaft.id, Regions.LOWER_DECK);
  world.assignRoom(cargoBay.id, Regions.LOWER_DECK);
  world.assignRoom(cargoHold.id, Regions.LOWER_DECK);
  world.assignRoom(storageAnnex.id, Regions.LOWER_DECK);
  world.assignRoom(lowerMidCorridor.id, Regions.LOWER_DECK);
  world.assignRoom(cryoBay.id, Regions.LOWER_DECK);
  world.assignRoom(cryoControl.id, Regions.LOWER_DECK);
  world.assignRoom(aftCorridor.id, Regions.LOWER_DECK);
  world.assignRoom(engineering.id, Regions.LOWER_DECK);
  world.assignRoom(reactorRoom.id, Regions.LOWER_DECK);
  // Mid Deck
  world.assignRoom(centralJunction.id, Regions.MID_DECK);
  world.assignRoom(labCorridor.id, Regions.MID_DECK);
  world.assignRoom(scienceLab.id, Regions.MID_DECK);
  world.assignRoom(medbay.id, Regions.MID_DECK);
  world.assignRoom(habCorridor.id, Regions.MID_DECK);
  world.assignRoom(messHall.id, Regions.MID_DECK);
  world.assignRoom(library.id, Regions.MID_DECK);
  // Upper Deck
  world.assignRoom(upperCorridor.id, Regions.UPPER_DECK);
  world.assignRoom(crewBunks.id, Regions.UPPER_DECK);
  world.assignRoom(commonArea.id, Regions.UPPER_DECK);
  world.assignRoom(captainsCabin.id, Regions.UPPER_DECK);
  world.assignRoom(bridge.id, Regions.UPPER_DECK);

  return {
    tugCargoHold: tugCargoHold.id,
    tugCockpit: tugCockpit.id,
    airlock: airlock.id,
    forwardCorridor: forwardCorridor.id,
    maintenanceShaft: maintenanceShaft.id,
    cargoBay: cargoBay.id,
    cargoHold: cargoHold.id,
    storageAnnex: storageAnnex.id,
    lowerMidCorridor: lowerMidCorridor.id,
    cryoBay: cryoBay.id,
    cryoControl: cryoControl.id,
    aftCorridor: aftCorridor.id,
    engineering: engineering.id,
    reactorRoom: reactorRoom.id,
    centralJunction: centralJunction.id,
    labCorridor: labCorridor.id,
    scienceLab: scienceLab.id,
    medbay: medbay.id,
    habCorridor: habCorridor.id,
    messHall: messHall.id,
    library: library.id,
    upperCorridor: upperCorridor.id,
    crewBunks: crewBunks.id,
    commonArea: commonArea.id,
    captainsCabin: captainsCabin.id,
    bridge: bridge.id,
  };
}

// ============================================================================
// ITEMS
// ============================================================================

export function createItems(world: WorldModel, rooms: RoomIds): ItemIds {
  // === PORTABLE ITEMS ===

  const flashlight = world.createEntity('flashlight', EntityType.ITEM);
  flashlight.add(new IdentityTrait({
    name: 'flashlight',
    description: 'A heavy-duty work flashlight. The battery indicator shows half charge.',
    aliases: ['torch', 'light', 'lamp'],
    adjectives: ['heavy-duty', 'work'],
    article: 'a',
  }));
  flashlight.add(new SwitchableTrait({ isOn: true }));
  flashlight.add(new LightSourceTrait({ brightness: 3, isLit: true }));
  world.moveEntity(flashlight.id, rooms.tugCargoHold);

  const rationBar = world.createEntity('ration bar', EntityType.ITEM);
  rationBar.add(new IdentityTrait({
    name: 'ration bar',
    description: 'A Meridian Solutions branded ration bar. "Your Productivity Is Your Legacy" is printed on the wrapper.',
    aliases: ['ration', 'bar', 'food', 'snack'],
    adjectives: ['ration'],
    article: 'a',
  }));
  world.moveEntity(rationBar.id, rooms.tugCargoHold);

  const multitool = world.createEntity('multi-tool', EntityType.ITEM);
  multitool.add(new IdentityTrait({
    name: 'multi-tool',
    description: 'A folding multi-tool with pliers, screwdriver heads, a pry bar, and a short blade. Standard salvage crew issue.',
    aliases: ['tool', 'tools', 'pliers', 'screwdriver', 'pry bar', 'blade', 'knife'],
    adjectives: ['multi', 'folding'],
    article: 'a',
  }));
  world.moveEntity(multitool.id, rooms.engineering);

  const stunBaton = world.createEntity('stun baton', EntityType.ITEM);
  stunBaton.add(new IdentityTrait({
    name: 'stun baton',
    description: 'A security-grade stun baton. The charge indicator glows blue. Non-lethal, theoretically.',
    aliases: ['baton', 'weapon', 'stun weapon', 'taser'],
    adjectives: ['stun', 'security'],
    article: 'a',
  }));
  world.moveEntity(stunBaton.id, rooms.crewBunks);

  const keycard = world.createEntity('bridge keycard', EntityType.ITEM);
  keycard.add(new IdentityTrait({
    name: 'bridge keycard',
    description: "A magnetic keycard stamped 'BRIDGE ACCESS — CAPTAINONLY.' The Meridian Solutions logo is embossed in silver.",
    aliases: ['keycard', 'card', 'key card', 'key', 'access card', 'magnetic card'],
    adjectives: ['bridge', 'magnetic', "captain's"],
    article: 'a',
  }));
  // Placed inside captain's desk (below)

  const captainsJournal = world.createEntity("captain's journal", EntityType.ITEM);
  captainsJournal.add(new IdentityTrait({
    name: "captain's journal",
    description: 'A leather-bound journal filled with tight handwriting. The last entries are erratic, the pen strokes heavy.',
    aliases: ['journal', 'diary', 'notebook', 'book', 'log'],
    adjectives: ["captain's", 'leather', 'handwritten'],
    article: 'a',
  }));
  captainsJournal.add(new ReadableTrait({
    text: "Final entries:\n\n\"Day 847 — Meridian lied about the cargo. It's not industrial samples. Reed found organism cultures in the hold. Living ones.\"\n\n\"Day 851 — Three crew showing symptoms. Not sick exactly. Changed. Vasik says corporate will handle it. Corporate is 40 light-years away.\"\n\n\"Day 855 — Sealed the hold. Locked SOMS out of cryo controls. If I don't make it, the bridge keycard is in my desk. Don't trust the AI. Don't trust anyone who smiles too much.\"\n\n\"Day 856 — I can hear it thinking.\"",
    isReadable: true,
  }));
  // Placed in captain's cabin (loose)
  world.moveEntity(captainsJournal.id, rooms.captainsCabin);

  const hazmatSuit = world.createEntity('hazmat suit', EntityType.ITEM);
  hazmatSuit.add(new IdentityTrait({
    name: 'hazmat suit',
    description: 'A yellow chemical/biological hazmat suit with integrated respirator. Meridian Solutions safety equipment — "Your Safety Is Our Priority (Terms Apply)."',
    aliases: ['suit', 'hazmat', 'protection', 'protective suit', 'yellow suit'],
    adjectives: ['hazmat', 'yellow', 'protective'],
    article: 'a',
  }));
  world.moveEntity(hazmatSuit.id, rooms.storageAnnex);

  const elevatorParts = world.createEntity('elevator parts', EntityType.ITEM);
  elevatorParts.add(new IdentityTrait({
    name: 'elevator parts',
    description: 'A motor assembly and replacement cable spool — the parts needed to repair the elevator to the cryo deck.',
    aliases: ['parts', 'motor', 'cable', 'spool', 'motor assembly', 'replacement parts', 'elevator repair'],
    adjectives: ['elevator', 'replacement'],
    article: 'some',
    grammaticalNumber: 'plural',
  }));
  world.moveEntity(elevatorParts.id, rooms.storageAnnex);

  const foodMakerParts = world.createEntity('fabricator parts', EntityType.ITEM);
  foodMakerParts.add(new IdentityTrait({
    name: 'fabricator parts',
    description: 'Replacement heating elements and a filtration cartridge for a food fabrication unit.',
    aliases: ['food parts', 'heating elements', 'cartridge', 'fabricator repair'],
    adjectives: ['fabricator', 'replacement'],
    article: 'some',
    grammaticalNumber: 'plural',
  }));
  world.moveEntity(foodMakerParts.id, rooms.storageAnnex);

  const dataChip = world.createEntity('data chip', EntityType.ITEM);
  dataChip.add(new IdentityTrait({
    name: 'data chip',
    description: 'A small encrypted data chip. Someone hid this deliberately. The label reads: "MERIDIAN SOLUTIONS — PROJECT STILLWATER — CLASSIFIED."',
    aliases: ['chip', 'data', 'encrypted chip', 'evidence'],
    adjectives: ['data', 'encrypted', 'hidden', 'stolen'],
    article: 'a',
    concealed: true,
  }));
  world.moveEntity(dataChip.id, rooms.messHall);

  const medkit = world.createEntity('medkit', EntityType.ITEM);
  medkit.add(new IdentityTrait({
    name: 'medkit',
    description: 'A standard medical kit containing bandages, stimulants, and a course of broad-spectrum anti-pathogen treatment.',
    aliases: ['medical kit', 'kit', 'medicine', 'medical supplies', 'supplies', 'bandages', 'treatment'],
    adjectives: ['medical', 'standard'],
    article: 'a',
  }));
  world.moveEntity(medkit.id, rooms.medbay);

  const evaSuit = world.createEntity('EVA suit', EntityType.ITEM);
  evaSuit.add(new IdentityTrait({
    name: 'EVA suit',
    description: 'A full extravehicular activity suit for hull maintenance. Bulky but functional.',
    aliases: ['spacesuit', 'space suit', 'suit', 'eva'],
    adjectives: ['EVA', 'extravehicular'],
    article: 'an',
  }));
  world.moveEntity(evaSuit.id, rooms.crewBunks);

  const overrideTool = world.createEntity('security override tool', EntityType.ITEM);
  overrideTool.add(new IdentityTrait({
    name: 'security override tool',
    description: 'A handheld device for bypassing Meridian Solutions security locks. Red housing, single button, small display.',
    aliases: ['override', 'override tool', 'security tool', 'bypass', 'device'],
    adjectives: ['security', 'override', 'handheld'],
    article: 'a',
  }));
  world.moveEntity(overrideTool.id, rooms.engineering);

  const cableSnips = world.createEntity('cable snips', EntityType.ITEM);
  cableSnips.add(new IdentityTrait({
    name: 'cable snips',
    description: 'Heavy-duty cable cutters rated for fiber-optic and power conduit. The jaws are sharp.',
    aliases: ['snips', 'cutters', 'cable cutters', 'clippers'],
    adjectives: ['cable', 'heavy-duty'],
    article: 'a pair of',
  }));
  world.moveEntity(cableSnips.id, rooms.engineering);

  // === DOORS ===

  // Airlock door (locked until docking SEALED — gates cockpit↔airlock)
  const airlockDoor = world.createEntity('airlock door', EntityType.DOOR);
  airlockDoor.add(new IdentityTrait({
    name: 'airlock door',
    description: 'A heavy pressure door between the tug and The Stillwater.',
    aliases: ['pressure door', 'hatch'],
    adjectives: ['airlock', 'pressure', 'heavy'],
    article: 'the',
  }));
  airlockDoor.add(new OpenableTrait({ isOpen: false }));
  airlockDoor.add(new LockableTrait({
    isLocked: true,
    lockedMessage: "The airlock is sealed. You need to complete the docking sequence first.",
  }));
  airlockDoor.add(new DoorTrait({ room1: rooms.tugCockpit, room2: rooms.airlock }));
  airlockDoor.add(new SceneryTrait());
  airlockDoor.add(new ShipPropTrait('airlock-door'));
  world.moveEntity(airlockDoor.id, rooms.tugCockpit);

  // Wire cockpit↔airlock exit via door (manually, like bridge door)
  const cockpitEntity = world.getEntity(rooms.tugCockpit);
  const airlockRoomEntity = world.getEntity(rooms.airlock);
  const ckRoom = cockpitEntity?.get(RoomTrait);
  const alRoom = airlockRoomEntity?.get(RoomTrait);
  if (ckRoom) ckRoom.exits[Direction.SOUTH] = { destination: rooms.airlock, via: airlockDoor.id };
  if (alRoom) alRoom.exits[Direction.NORTH] = { destination: rooms.tugCockpit, via: airlockDoor.id };

  // Bridge door (locked by keycard)
  const bridgeDoor = world.createEntity('bridge door', EntityType.DOOR);
  bridgeDoor.add(new IdentityTrait({
    name: 'bridge door',
    description: 'A heavy security door with a keycard reader. The reader blinks red — locked.',
    aliases: ['security door', 'bridge hatch', 'door'],
    adjectives: ['bridge', 'security', 'heavy'],
    article: 'the',
  }));
  bridgeDoor.add(new OpenableTrait({ isOpen: false }));
  bridgeDoor.add(new LockableTrait({
    isLocked: true,
    keyId: keycard.id,
    lockedMessage: 'The keycard reader blinks red. You need a bridge keycard.',
  }));
  bridgeDoor.add(new DoorTrait({ room1: rooms.upperCorridor, room2: rooms.bridge }));
  bridgeDoor.add(new SceneryTrait());
  world.moveEntity(bridgeDoor.id, rooms.upperCorridor);

  // Wire bridge door exits manually
  const upperCorridorEntity = world.getEntity(rooms.upperCorridor);
  const bridgeEntity = world.getEntity(rooms.bridge);
  const ucRoom = upperCorridorEntity?.get(RoomTrait);
  const brRoom = bridgeEntity?.get(RoomTrait);
  if (ucRoom) ucRoom.exits[Direction.NORTH] = { destination: rooms.bridge, via: bridgeDoor.id };
  if (brRoom) brRoom.exits[Direction.SOUTH] = { destination: rooms.upperCorridor, via: bridgeDoor.id };

  // Cargo hold door (locked by code — no keyId, opened programmatically)
  const cargoHoldDoor = world.createEntity('cargo hold bulkhead', EntityType.DOOR);
  cargoHoldDoor.add(new IdentityTrait({
    name: 'cargo hold bulkhead',
    description: 'A reinforced bulkhead with a security keypad. The display reads "ENTER ACCESS CODE."',
    aliases: ['bulkhead', 'hold door', 'cargo door', 'security door'],
    adjectives: ['cargo', 'reinforced', 'hold'],
    article: 'the',
  }));
  cargoHoldDoor.add(new OpenableTrait({ isOpen: false }));
  cargoHoldDoor.add(new LockableTrait({
    isLocked: true,
    lockedMessage: 'The keypad blinks. You need the access code.',
  }));
  cargoHoldDoor.add(new DoorTrait({ room1: rooms.cargoBay, room2: rooms.cargoHold }));
  cargoHoldDoor.add(new SceneryTrait());
  cargoHoldDoor.add(new ShipPropTrait('cargo-keypad'));
  world.moveEntity(cargoHoldDoor.id, rooms.cargoBay);

  // Wire cargo hold door exits
  const cargoBayEntity = world.getEntity(rooms.cargoBay);
  const cargoHoldEntity = world.getEntity(rooms.cargoHold);
  const cbRoom = cargoBayEntity?.get(RoomTrait);
  const chRoom = cargoHoldEntity?.get(RoomTrait);
  if (cbRoom) cbRoom.exits[Direction.SOUTH] = { destination: rooms.cargoHold, via: cargoHoldDoor.id };
  if (chRoom) chRoom.exits[Direction.NORTH] = { destination: rooms.cargoBay, via: cargoHoldDoor.id };

  // === CONTAINERS ===

  // Captain's desk (locked, contains keycard)
  const captainsDesk = world.createEntity('locked desk', EntityType.ITEM);
  captainsDesk.add(new IdentityTrait({
    name: 'locked desk',
    description: 'A standard-issue officer\'s desk bolted to the bulkhead. The drawer has a simple mechanical lock.',
    aliases: ['desk', 'drawer', 'drawers', "captain's desk", 'desk drawer'],
    adjectives: ['locked', "captain's", 'officer'],
    article: 'a',
  }));
  captainsDesk.add(new ContainerTrait({ isTransparent: false }));
  captainsDesk.add(new OpenableTrait({ isOpen: false, canClose: true }));
  captainsDesk.add(new LockableTrait({
    isLocked: true,
    lockedMessage: 'The desk drawer is locked with a mechanical lock. You might be able to force it open.',
  }));
  captainsDesk.add(new SceneryTrait({ cantTakeMessage: 'The desk is bolted to the bulkhead.' }));
  captainsDesk.add(new ShipPropTrait('captains-desk'));
  world.moveEntity(captainsDesk.id, rooms.captainsCabin);

  // Place keycard inside desk (AuthorModel bypass)
  const deskLock = captainsDesk.get(LockableTrait);
  const deskOpen = captainsDesk.get(OpenableTrait);
  if (deskLock && deskOpen) {
    deskLock.isLocked = false;
    deskOpen.isOpen = true;
    world.moveEntity(keycard.id, captainsDesk.id);
    deskOpen.isOpen = false;
    deskLock.isLocked = true;
  }

  // Weapons crate (locked)
  const weaponsCrate = world.createEntity('weapons crate', EntityType.ITEM);
  weaponsCrate.add(new IdentityTrait({
    name: 'weapons crate',
    description: 'A reinforced crate stamped "MERIDIAN SOLUTIONS — SECURITY EQUIPMENT." The lock is heavy-duty.',
    aliases: ['crate', 'box', 'weapons box', 'security crate'],
    adjectives: ['weapons', 'reinforced', 'locked'],
    article: 'a',
  }));
  weaponsCrate.add(new ContainerTrait({ isTransparent: false }));
  weaponsCrate.add(new OpenableTrait({ isOpen: false, canClose: true }));
  weaponsCrate.add(new LockableTrait({
    isLocked: true,
    lockedMessage: 'The crate is sealed with a heavy-duty corporate lock.',
  }));
  weaponsCrate.add(new SceneryTrait({ cantTakeMessage: 'Too heavy to carry.' }));
  weaponsCrate.add(new ShipPropTrait('weapons-crate'));
  world.moveEntity(weaponsCrate.id, rooms.storageAnnex);

  // === SCOPE ===

  keycard.scope('if.action.unlocking', 150);

  return {
    flashlight: flashlight.id,
    rationBar: rationBar.id,
    multitool: multitool.id,
    stunBaton: stunBaton.id,
    keycard: keycard.id,
    captainsJournal: captainsJournal.id,
    hazmatSuit: hazmatSuit.id,
    elevatorParts: elevatorParts.id,
    foodMakerParts: foodMakerParts.id,
    dataChip: dataChip.id,
    medkit: medkit.id,
    evaSuit: evaSuit.id,
    overrideTool: overrideTool.id,
    cableSnips: cableSnips.id,
    airlockDoor: airlockDoor.id,
    bridgeDoor: bridgeDoor.id,
    cargoHoldDoor: cargoHoldDoor.id,
    captainsDesk: captainsDesk.id,
    weaponsCrate: weaponsCrate.id,
  };
}

// ============================================================================
// SCENERY
// ============================================================================

export function createScenery(world: WorldModel, rooms: RoomIds, items: ItemIds): void {
  // --- Tug Cargo Hold ---
  const shippingCrates = createSceneryEntity(world, 'shipping crates', rooms.tugCargoHold,
    'Crates strapped to the walls, stenciled "DEEP REACH SALVAGE." Your crates. Your cargo.',
    { aliases: ['crates', 'crate', 'containers', 'boxes'], adjectives: ['shipping'], article: 'the', grammaticalNumber: 'plural', propId: 'shipping-crates' });
  shippingCrates.add(new MemoryTrait('if.action.examining', 'story.memory.crates'));

  const bedroll = createSceneryEntity(world, 'bedroll', rooms.tugCargoHold,
    "A thin sleeping pad wedged between containers. You've been here a while — the indent has your shape.",
    { aliases: ['bed', 'sleeping pad', 'pad', 'hiding spot', 'sleeping spot'], adjectives: ['thin'], article: 'a', propId: 'bedroll' });
  bedroll.add(new MemoryTrait('if.action.examining', 'story.memory.bedroll'));

  const datapad = createSceneryEntity(world, 'datapad', rooms.tugCargoHold,
    'A salvage manifest on a scratched screen. Last entry: "LONG HAUL — DRIFT MODE ENGAGED. ETA: UNKNOWN."',
    { aliases: ['manifest', 'pad', 'screen', 'tablet', 'data pad'], adjectives: ['salvage'], article: 'a', propId: 'datapad' });
  datapad.add(new ReadableTrait({
    text: 'DEEP REACH SALVAGE — MANIFEST\n\nCargo: Misc. salvage (unsorted)\nDestination: Kovac Freeport\nFuel: CRITICAL — 3%\nStatus: DRIFT MODE\nNotes: "Fuel ran out past the Kepler relay. Nothing in range. Engaged drift mode, set proximity alarm. If something comes close enough, maybe I can dock and scavenge fuel. If not — well. It was a good run."',
    isReadable: true,
  }));
  datapad.add(new MemoryTrait('if.action.examining', 'story.memory.datapad'));

  // --- Tug Cockpit ---
  createSceneryEntity(world, 'instrument panels', rooms.tugCockpit,
    'Instrument panels flash amber in time with the proximity alarm. Most readings are drowned out by the strobing.',
    { aliases: ['panels', 'instruments', 'console'], adjectives: ['instrument', 'amber'], article: 'the', grammaticalNumber: 'plural' });
  createSceneryEntity(world, 'tug viewport', rooms.tugCockpit,
    "Through the viewport, The Stillwater's hull fills your view. A corporate freighter, massive and dark. No running lights. Getting closer.",
    { aliases: ['viewport', 'window', 'view', 'porthole'], adjectives: ['tug'], article: 'the', propId: 'tug-viewport' });

  createSceneryEntity(world, 'alarm button', rooms.tugCockpit,
    'A big red button set into the console, strobing in time with the alarm. The proximity alarm override.',
    { aliases: ['button', 'red button', 'proximity alarm', 'alarm'], adjectives: ['red', 'alarm', 'big', 'proximity'], article: 'the', propId: 'alarm-button' });

  createSceneryEntity(world, 'docking controls', rooms.tugCockpit,
    'Manual docking controls — joystick, throttle, and a bank of status indicators. Standard salvage rig setup. You know this.\n\nSequence: MANEUVER to take control, then CONNECT to extend the docking arm, then SEAL to pressurize.',
    { aliases: ['controls', 'joystick', 'throttle', 'docking panel', 'docking console'], adjectives: ['docking', 'manual'], article: 'the', propId: 'docking-controls' });

  const fuelGauge = createSceneryEntity(world, 'fuel gauge', rooms.tugCockpit,
    'Three percent. Not enough to reach the next port. Not enough to divert. Barely enough to keep life support running.',
    { aliases: ['gauge', 'fuel', 'fuel indicator', 'fuel reading'], adjectives: ['fuel'], article: 'the', propId: 'fuel-gauge' });
  fuelGauge.add(new MemoryTrait('if.action.examining', 'story.memory.fuel'));

  const tugComms = createSceneryEntity(world, 'comms system', rooms.tugCockpit,
    'Your comms rig. The display reads: "NO SIGNAL." Too far from any relay. No one knows you\'re here.',
    { aliases: ['comms', 'radio', 'communications', 'comm', 'comms rig'], adjectives: ['comms', 'tug'], article: 'the', propId: 'tug-comms' });
  tugComms.add(new MemoryTrait('if.action.examining', 'story.memory.comms'));

  createSceneryEntity(world, "pilot's seat", rooms.tugCockpit,
    "Worn cushion, fraying straps. You've sat here for thousands of hours. It smells like recycled air and bad coffee.",
    { aliases: ['seat', 'chair', 'pilot seat'], adjectives: ["pilot's", 'worn'], article: 'the' });

  // --- Airlock ---
  createSceneryEntity(world, 'biohazard sign', rooms.airlock,
    '"BIOHAZARD CONTAINMENT PROTOCOLS IN EFFECT. Report symptoms to your supervisor. Meridian Solutions cares about your wellbeing."',
    { aliases: ['sign', 'warning', 'biohazard', 'decals', 'warning sign'], adjectives: ['biohazard', 'warning'], article: 'a', propId: 'biohazard-sign' });
  const sign = world.getEntity(getSceneryId('biohazard-sign'));
  if (sign) sign.add(new ReadableTrait({ text: 'BIOHAZARD CONTAINMENT PROTOCOLS IN EFFECT. Report symptoms to your supervisor. Meridian Solutions cares about your wellbeing.', isReadable: true }));

  createSceneryEntity(world, 'emergency locker', rooms.airlock,
    'A wall-mounted emergency locker. The door hangs open. Inside: empty brackets where equipment used to be.',
    { aliases: ['locker', 'cabinet', 'emergency cabinet'], adjectives: ['emergency', 'wall-mounted'], article: 'an' });

  createSceneryEntity(world, 'inspection window', rooms.airlock,
    'A small reinforced window in the airlock hull. Through it, you can see the docking junction and a sliver of space beyond.',
    { aliases: ['window', 'porthole', 'viewport', 'glass'], adjectives: ['inspection', 'reinforced', 'small'], article: 'an', propId: 'inspection-window' });

  createSceneryEntity(world, 'claw marks', rooms.airlock,
    'Deep gouges along the inner door frame. Something — someone — clawed at this door from inside. Hard enough to score metal.',
    { aliases: ['marks', 'scratches', 'gouges', 'claw'], adjectives: ['claw'], article: 'the', grammaticalNumber: 'plural' });

  // --- Forward Corridor ---
  createSceneryEntity(world, 'overhead pipes', rooms.forwardCorridor,
    'Condensation drips from the pipes. The metal is cold.',
    { aliases: ['pipes', 'pipe', 'condensation'], adjectives: ['overhead'], article: 'the', grammaticalNumber: 'plural' });
  createSceneryEntity(world, 'floor panel', rooms.forwardCorridor,
    'A loose floor panel. Beneath it, cables snake into darkness.',
    { aliases: ['panel', 'loose panel', 'floor', 'cables'], adjectives: ['floor', 'loose'], article: 'a', propId: 'floor-panel' });

  // --- Maintenance Shaft ---
  createSceneryEntity(world, 'fiber-optic cables', rooms.maintenanceShaft,
    'Thick bundles of fiber-optic cable. Some carry data. Some carry something else — they pulse faintly with blue light.',
    { aliases: ['cables', 'cable', 'fiber', 'wires', 'wire', 'optic', 'fiber optics'], adjectives: ['fiber-optic', 'blue', 'pulsing'], article: 'the', grammaticalNumber: 'plural', propId: 'ai-cables' });
  createSceneryEntity(world, 'junction box', rooms.maintenanceShaft,
    'A junction box where multiple cable runs converge. Labels identify each run: BRIDGE, ENGINEERING, CRYO, COMMS. One cable is labeled CORE.',
    { aliases: ['box', 'junction', 'labels', 'label'], adjectives: ['junction'], article: 'a', propId: 'junction-box' });

  // --- Cargo Bay ---
  createSceneryEntity(world, 'shipping containers', rooms.cargoBay,
    'Industrial shipping containers. Some have been forced open — empty, or holding mundane cargo.',
    { aliases: ['containers', 'container', 'crate', 'crates'], adjectives: ['shipping', 'industrial'], article: 'the', grammaticalNumber: 'plural' });
  createSceneryEntity(world, 'improvised bedding', rooms.cargoBay,
    'A sleeping area made from thermal blankets and cargo padding. Someone has been living here.',
    { aliases: ['bedding', 'bed', 'blankets', 'camp', 'sleeping area'], adjectives: ['improvised', 'makeshift'], article: 'the' });
  createSceneryEntity(world, 'makeshift barricade', rooms.cargoBay,
    'Crates and deck plates stacked as a defensive position. Whoever built this was scared of something.',
    { aliases: ['barricade', 'barrier', 'wall'], adjectives: ['makeshift', 'crate'], article: 'a', propId: 'cargo-barricade' });

  // --- Cargo Hold ---
  createSceneryEntity(world, 'transport containers', rooms.cargoHold,
    'Sealed containers with biohazard markings and Meridian Solutions logos. The seals on some are cracked. A faint organic smell seeps out.',
    { aliases: ['containers', 'container', 'bioweapon', 'biohazard containers'], adjectives: ['transport', 'sealed', 'biohazard'], article: 'the', grammaticalNumber: 'plural' });
  createSceneryEntity(world, 'warning labels', rooms.cargoHold,
    '"BIOLOGICAL MATERIAL — HANDLE PER PROTOCOL 7-GAMMA. Unauthorized access constitutes breach of employment agreement Section 14(c)."',
    { aliases: ['labels', 'label', 'warnings', 'markings'], adjectives: ['warning'], article: 'the', grammaticalNumber: 'plural' });

  // --- Storage Annex ---
  createSceneryEntity(world, 'industrial shelving', rooms.storageAnnex,
    'Metal shelving bolted to the walls, stocked with spare parts and sealed containers.',
    { aliases: ['shelving', 'shelves', 'shelf', 'racks', 'rack'], adjectives: ['industrial', 'metal'], article: 'the' });

  // --- Lower Mid Corridor ---
  createSceneryEntity(world, 'direction signs', rooms.lowerMidCorridor,
    '"FORE: Docking / Cargo. AFT: Engineering / Reactor. UP: Operations." The Meridian Solutions font is aggressively cheerful.',
    { aliases: ['signs', 'sign', 'directions'], adjectives: ['direction', 'corporate'], article: 'the', grammaticalNumber: 'plural' });
  const elevator = createSceneryEntity(world, 'elevator', rooms.lowerMidCorridor,
    'A freight elevator leading down to the cryo deck. The control panel is dead — the motor assembly has failed.',
    { aliases: ['lift', 'freight elevator', 'elevator alcove'], adjectives: ['freight', 'broken'], article: 'the', propId: 'elevator' });

  // --- Cryo Bay ---
  createSceneryEntity(world, 'cryo pods', rooms.cryoBay,
    'Hundreds of cryo pods stacked in rows. Status lights tell the story: green (alive), amber (degrading), red (critical), dark (empty or dead). Too many are red.',
    { aliases: ['pods', 'pod', 'cryopods', 'cryopod', 'cryo pod'], adjectives: ['cryo', 'frozen'], article: 'the', grammaticalNumber: 'plural', propId: 'cryo-pods' });
  createSceneryEntity(world, 'leaked fluid', rooms.cryoBay,
    'Cryo fluid pooled on the deck. It has an iridescent sheen and smells faintly of ammonia and something alive.',
    { aliases: ['fluid', 'liquid', 'pool', 'puddle', 'cryo fluid'], adjectives: ['leaked', 'iridescent'], article: 'the', propId: 'leaked-fluid' });

  // --- Cryo Control ---
  createSceneryEntity(world, 'pod status terminal', rooms.cryoControl,
    'A terminal displaying cryo pod statistics. Alive: 247. Critical: 38. Failed: 89. Empty: 126.',
    { aliases: ['terminal', 'display', 'monitor', 'status', 'screen'], adjectives: ['pod', 'status'], article: 'a', propId: 'cryo-terminal' });
  const cryoTerm = world.getEntity(getSceneryId('cryo-terminal'));
  if (cryoTerm) cryoTerm.add(new TerminalTrait('cryo-control', true));

  createSceneryEntity(world, 'thaw controls', rooms.cryoControl,
    'Selective thaw interface. Individual pod addresses can be entered. A large red switch is labeled "EMERGENCY PURGE — ALL PODS."',
    { aliases: ['thaw', 'controls', 'purge', 'purge switch', 'red switch', 'switch'], adjectives: ['thaw', 'selective', 'purge'], article: 'the', propId: 'thaw-controls' });

  // --- Aft Corridor ---
  createSceneryEntity(world, 'temperature gauge', rooms.aftCorridor,
    'A wall-mounted gauge. The needle sits higher than it should. The reactor is generating more heat than the cooling system can handle.',
    { aliases: ['gauge', 'thermometer', 'temp'], adjectives: ['temperature', 'wall-mounted'], article: 'a', propId: 'temp-gauge' });

  // --- Engineering ---
  createSceneryEntity(world, 'reactor controls', rooms.engineering,
    'The main reactor control panel. Power routing, coolant management, safety overrides. Everything needed to keep the ship alive — or shut it down.',
    { aliases: ['controls', 'panel', 'console', 'reactor panel'], adjectives: ['reactor', 'main'], article: 'the', propId: 'reactor-controls' });
  createSceneryEntity(world, 'tool rack', rooms.engineering,
    'A wall-mounted tool rack. Most slots are empty. The remaining tools are heavy-duty engineering equipment.',
    { aliases: ['rack', 'tools'], adjectives: ['tool', 'wall-mounted'], article: 'a' });
  const commsRelay = createSceneryEntity(world, 'comms relay', rooms.engineering,
    'A communications relay unit. The physical transmitter hardware for ship-to-ship and deep-space communication. Currently disconnected from the bridge array.',
    { aliases: ['relay', 'comms', 'transmitter', 'communications relay'], adjectives: ['comms', 'communications'], article: 'the', propId: 'comms-relay' });

  // --- Reactor Room ---
  createSceneryEntity(world, 'reactor core', rooms.reactorRoom,
    'The reactor core. A contained fusion reaction — normally. The containment field indicators are fluctuating.',
    { aliases: ['core', 'reactor', 'fusion'], adjectives: ['reactor', 'fusion'], article: 'the', propId: 'reactor-core' });
  const rr = world.getEntity(rooms.reactorRoom);
  if (rr) rr.add(new HazardTrait('radiation', 2));

  // --- Central Junction ---
  createSceneryEntity(world, 'corporate signage', rooms.centralJunction,
    '"People First. Profit Always." The corporate logo is everywhere. Beneath one poster, someone scratched: "People are the product."',
    { aliases: ['signage', 'signs', 'poster', 'posters', 'logo'], adjectives: ['corporate', 'Meridian'], article: 'the' });

  // --- Lab Corridor ---
  createSceneryEntity(world, 'chemical spill', rooms.labCorridor,
    'A dried chemical stain on the deck. Whatever it was, it ate into the surface.',
    { aliases: ['spill', 'stain', 'chemical'], adjectives: ['chemical', 'dried'], article: 'a' });
  createSceneryEntity(world, 'safety station', rooms.labCorridor,
    'An eye wash station and a box of disposable gloves. Standard lab safety equipment.',
    { aliases: ['station', 'eye wash', 'gloves', 'safety'], adjectives: ['safety'], article: 'a' });

  // --- Science Lab ---
  const researchTerminal = createSceneryEntity(world, 'research terminal', rooms.scienceLab,
    'A terminal with a half-corrupted display. Fragments of research logs are still readable.',
    { aliases: ['terminal', 'computer', 'screen', 'display', 'monitor'], adjectives: ['research'], article: 'a', propId: 'research-terminal' });
  researchTerminal.add(new TerminalTrait('research', true));
  researchTerminal.add(new ReadableTrait({
    text: "RESEARCH LOG — FRAGMENTS:\n\n\"...organism shows remarkable adaptability. Not a pathogen in the traditional sense. It integrates with host neural tissue...\"\n\n\"...behavioral changes precede physical symptoms. Subjects show altered speech patterns, confusion, then a period of apparent recovery before...\"\n\n\"...recommend immediate quarantine of all exposed personnel. Dr. Chen's objections have been noted and overruled per Meridian directive 7-G...\"\n\n\"...it's not killing them. It's replacing them. Slowly. From the inside.\"",
    isReadable: true,
  }));

  createSceneryEntity(world, 'sample containers', rooms.scienceLab,
    'Sealed glass containers holding specimens in suspension fluid. Most are labeled. Some are cracked.',
    { aliases: ['samples', 'containers', 'specimens', 'glass'], adjectives: ['sample', 'sealed'], article: 'the', grammaticalNumber: 'plural' });

  // --- Medbay ---
  createSceneryEntity(world, 'quarantine cell', rooms.medbay,
    'A reinforced observation cell. The door has been bent outward — from the inside. Whatever was in there got out.',
    { aliases: ['cell', 'quarantine', 'observation cell'], adjectives: ['quarantine', 'reinforced'], article: 'the', propId: 'quarantine-cell' });
  createSceneryEntity(world, 'patient logs', rooms.medbay,
    'Medical records on a wall-mounted tablet. The last entries document behavioral changes in crew members.',
    { aliases: ['logs', 'records', 'tablet', 'medical records'], adjectives: ['patient', 'medical'], article: 'the', propId: 'patient-logs' });
  const patientLogs = world.getEntity(getSceneryId('patient-logs'));
  if (patientLogs) patientLogs.add(new ReadableTrait({
    text: "PATIENT LOG:\n\nCrew Member Reed, J. — Day 849: Presents with mild confusion, word-finding difficulty. Attributes to fatigue. No fever.\n\nCrew Member Chen, L. — Day 850: Reported by colleagues as 'acting strange.' Patient denies symptoms. Smiling.\n\nCrew Member Lis, K. — Day 852: Intermittent episodes of dissociation. Claims 'something is thinking for me.' Sedated per protocol.\n\n[REMAINING RECORDS CORRUPTED]",
    isReadable: true,
  }));

  // --- Hab Corridor ---
  createSceneryEntity(world, 'crew photos', rooms.habCorridor,
    'Crew photos in mismatched frames. Smiling faces. Some frames have been turned to face the wall.',
    { aliases: ['photos', 'pictures', 'frames', 'photo'], adjectives: ['crew'], article: 'the', grammaticalNumber: 'plural' });
  createSceneryEntity(world, 'bulletin board', rooms.habCorridor,
    'Shift schedules, maintenance rosters, a sign-up sheet for movie night. One note in hasty marker reads: "DO NOT TRUST THE SYSTEM."',
    { aliases: ['board', 'bulletin', 'notices', 'note'], adjectives: ['bulletin'], article: 'the', propId: 'bulletin-board' });

  // --- Mess Hall ---
  createSceneryEntity(world, 'food fabrication unit', rooms.messHall,
    'A Meridian Solutions food fabrication unit. The power indicator is dark. A maintenance panel on the side is accessible.',
    { aliases: ['fabricator', 'food maker', 'food unit', 'unit', 'machine'], adjectives: ['food', 'fabrication'], article: 'the', propId: 'food-fabricator' });
  createSceneryEntity(world, 'propaganda posters', rooms.messHall,
    '"Your Productivity Is Your Legacy." "Meridian Solutions: Building Tomorrow\'s Workforce Today." "Report Unauthorized Conversations to Your Supervisor."',
    { aliases: ['posters', 'poster', 'propaganda'], adjectives: ['corporate', 'propaganda'], article: 'the', grammaticalNumber: 'plural' });
  createSceneryEntity(world, 'crew mugs', rooms.messHall,
    "Abandoned coffee mugs with names scratched or painted on them. Reed. Chen. Vasik. Okafor. Lis. The captain's mug just says 'CAP.'",
    { aliases: ['mugs', 'mug', 'cups', 'cup', 'coffee'], adjectives: ['crew', 'coffee'], article: 'the', grammaticalNumber: 'plural' });

  // --- Library ---
  const libraryTerminal = createSceneryEntity(world, 'archive terminal', rooms.library,
    'The ship\'s main data terminal. A cursor blinks on screen: "SOMS READY. QUERY?"',
    { aliases: ['terminal', 'computer', 'screen', 'display'], adjectives: ['archive', 'data', 'library'], article: 'the', propId: 'archive-terminal' });
  libraryTerminal.add(new TerminalTrait('archive', true));

  createSceneryEntity(world, 'data storage racks', rooms.library,
    'Rows of physical media — data crystals, backup drives. Some slots are empty. Some media is cracked or melted.',
    { aliases: ['racks', 'rack', 'storage', 'crystals', 'drives', 'media'], adjectives: ['data', 'storage'], article: 'the', grammaticalNumber: 'plural' });

  // --- Upper Corridor ---
  createSceneryEntity(world, 'ship schematics', rooms.upperCorridor,
    'Partial deck plans behind scratched plexiglass. Three decks: Lower (cargo, engineering), Mid (labs, habitation), Upper (crew, bridge).',
    { aliases: ['schematics', 'plans', 'map', 'deck plans', 'diagram'], adjectives: ['ship', 'deck'], article: 'the', grammaticalNumber: 'plural' });
  createSceneryEntity(world, 'intercom panel', rooms.upperCorridor,
    'A wall-mounted intercom. The speaker grille is dusty. A small status light is dark.',
    { aliases: ['intercom', 'panel', 'speaker'], adjectives: ['intercom', 'wall-mounted'], article: 'an', propId: 'intercom' });

  // --- Crew Bunks ---
  createSceneryEntity(world, 'scratched bunk', rooms.crewBunks,
    'Deep scratches gouged into the wall beside this bunk. Fingernail marks. The mattress below has dark stains.',
    { aliases: ['bunk', 'scratches', 'marks', 'stains', 'bed', 'mattress'], adjectives: ['scratched', 'damaged'], article: 'the', propId: 'scratched-bunk' });
  createSceneryEntity(world, 'security rack', rooms.crewBunks,
    'A wall-mounted equipment rack. Most slots are empty.',
    { aliases: ['rack', 'equipment rack'], adjectives: ['security', 'equipment'], article: 'a' });
  createSceneryEntity(world, 'EVA storage', rooms.crewBunks,
    'A recessed alcove with suit storage. One EVA suit remains.',
    { aliases: ['storage', 'alcove', 'suit storage'], adjectives: ['EVA', 'suit'], article: 'the' });

  // --- Common Area ---
  createSceneryEntity(world, 'common viewport', rooms.commonArea,
    'Through the viewport: black nothing. Stars. No other ships. No station. Nothing.',
    { aliases: ['viewport', 'window', 'view', 'porthole'], adjectives: ['common'], article: 'the', propId: 'common-viewport' });
  createSceneryEntity(world, 'furniture barricade', rooms.commonArea,
    'Tables, chairs, and deck plates piled into a barricade. Built to keep something out — or someone in.',
    { aliases: ['barricade', 'barrier', 'furniture', 'pile'], adjectives: ['furniture'], article: 'the', propId: 'vasik-barricade' });
  createSceneryEntity(world, 'card game', rooms.commonArea,
    'A half-finished card game. The cards are from a corporate team-building deck. One card reads: "Describe a time you exceeded expectations for your supervisor."',
    { aliases: ['cards', 'game', 'card game'], adjectives: ['card', 'half-finished'], article: 'a' });
  createSceneryEntity(world, 'air vent', rooms.commonArea,
    'A standard maintenance vent grille set into the ceiling. The screws look loose.',
    { aliases: ['vent', 'grille', 'grate', 'duct', 'air duct'], adjectives: ['air', 'ceiling'], article: 'an', propId: 'air-vent' });

  // --- Captain's Cabin ---
  createSceneryEntity(world, 'personal effects', rooms.captainsCabin,
    'Framed photographs of a family. A half-read novel bookmarked with a receipt. Dried flowers in a small vase. This was a person.',
    { aliases: ['effects', 'photos', 'photographs', 'flowers', 'vase', 'novel', 'book'], adjectives: ['personal', "captain's"], article: 'the', grammaticalNumber: 'plural' });

  // --- Bridge ---
  const navConsole = createSceneryEntity(world, 'navigation console', rooms.bridge,
    'The navigation display shows a star chart. A destination marker blinks: "MERIDIAN SOLUTIONS FACILITY — KORVAX STATION." Estimated arrival is counting down.',
    { aliases: ['navigation', 'nav', 'console', 'star chart', 'display'], adjectives: ['navigation', 'nav'], article: 'the', propId: 'nav-console' });
  navConsole.add(new TerminalTrait('navigation', true));

  const commsPanel = createSceneryEntity(world, 'comms array panel', rooms.bridge,
    'The bridge-side comms control panel. A display reads: "COMMS ARRAY: DISCONNECTED. Connect engineering relay to enable transmission."',
    { aliases: ['comms', 'array', 'comms panel', 'communications'], adjectives: ['comms', 'communications', 'bridge'], article: 'the', propId: 'comms-panel' });

  const captainsLog = createSceneryEntity(world, "captain's log terminal", rooms.bridge,
    "The captain's personal log terminal. The last entry is dated months ago.",
    { aliases: ['log', "captain's log", 'terminal', 'log terminal'], adjectives: ["captain's", 'personal', 'log'], article: 'the', propId: 'captains-log' });
  captainsLog.add(new TerminalTrait('captains-log', true));
  captainsLog.add(new ReadableTrait({
    text: "CAPTAIN'S LOG — FINAL ENTRY:\n\n\"They told me it was a transport contract. Prisoners to a rehabilitation facility. Lies.\n\nThe cargo isn't what they said. The prisoners aren't going to rehabilitation. And this ship's AI — SOMS — it knows things it shouldn't. It's been learning. Growing.\n\nI've locked it out of the bridge. I've locked out the comms. If it can't transmit, it can't spread.\n\nIf you're reading this, you're probably trapped too. I'm sorry.\n\nDon't connect the comms relay. Whatever SOMS tells you — don't.\"",
    isReadable: true,
  }));

  createSceneryEntity(world, 'security override panel', rooms.bridge,
    'A security override console. From here, any door on the ship can be locked or unlocked. Powerful — and dangerous.',
    { aliases: ['override', 'security panel', 'override panel', 'security console'], adjectives: ['security', 'override'], article: 'the', propId: 'security-panel' });

  // --- Escape pod (bridge-accessible) ---
  createSceneryEntity(world, 'escape pod hatch', rooms.bridge,
    'An emergency escape pod hatch in the deck. The status indicator shows green — the pod is functional.',
    { aliases: ['pod', 'escape pod', 'hatch', 'escape hatch', 'emergency pod'], adjectives: ['escape', 'emergency'], article: 'an', propId: 'escape-pod' });
}
