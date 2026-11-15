/* One scroll timeline; all positions are derived from it so reversing is deterministic. */
const journey = document.querySelector('.journey');
const stage = document.querySelector('.stage');
const nav = document.querySelector('.navigation');
const chapter = document.querySelector('.chapter-label');
const skipButton = document.querySelector('.skip-button');
const skipLabel = document.querySelector('.skip-label');
const world = document.querySelector('.world');
const houseSite = document.querySelector('.house-site');
const entryLight = document.querySelector('.entry-light');
const intro = document.querySelector('.intro-panel');
const traveller = document.querySelector('.traveller');
const groundContact = document.querySelector('.traveller-contact');
const threshold = document.querySelector('.threshold-copy');
const room = document.querySelector('.room');
const roomCopy = document.querySelector('.room-copy');
const questionBook = document.querySelector('.question-book');
const bookResting = document.querySelector('.book-resting');
const bookDepth = document.querySelector('.book-depth');
const pageTunnel = document.querySelector('.page-tunnel');
const fallPages = document.querySelector('.fall-pages');
const pageNearLeft = document.querySelector('.page-near-left');
const pageFarRight = document.querySelector('.page-far-right');
const pageNearRight = document.querySelector('.page-near-right');
const questionCopy = document.querySelector('.question-copy');
const thoughtTraveller = document.querySelector('.thought-traveller');
const thoughtReading = document.querySelector('.thought-reading');
const thoughtFalling = document.querySelector('.thought-falling');
const thoughtStanding = document.querySelector('.thought-standing');
const thoughtContact = document.querySelector('.thought-contact');
const archive = document.querySelector('.archive');
const archiveCopy = document.querySelector('.archive-copy');
const archiveIllustration = document.querySelector('.archive-illustration');
const researchStation = document.querySelector('.research-station');
const archiveTopics = document.querySelector('.research-topics');
const archiveCloseCopy = document.querySelector('.archive-close-copy');
const cabinet = document.querySelector('.research-cabinet');
const archiveBottom = document.querySelector('.archive-bottom');
const workshop = document.querySelector('.workshop');
const creationLight = document.querySelector('.creation-light');
const workshopCopy = document.querySelector('.workshop-copy');
const workshopArt = document.querySelector('.workshop-art');
const terminal = document.querySelector('.creative-terminal');
const doorway = document.querySelector('.world-doorway');
const portalFrame = document.querySelector('.portal-frame');
const colonyWorld = document.querySelector('.colony-world');
const screenLight = document.querySelector('.screen-light');
const worldProjection = document.querySelector('.world-projection');
const projectionVolume = document.querySelector('.projection-volume');
const projectSelector = document.querySelector('.project-selector');
const workshopContinue = document.querySelector('.workshop-continue');
const leisure = document.querySelector('.leisure');
const leisureCopy = document.querySelector('.leisure-copy');
const leisureObjects = document.querySelector('.leisure-objects');
const personalArt = document.querySelector('.personal-art');
const sketchbookToggle = document.querySelector('.sketchbook-toggle');
const sketchbookPages = document.querySelector('.sketchbook-pages');
const artViewer = document.querySelector('.art-viewer');
const viewerImage = document.querySelector('.viewer-image');
const leisureExit = document.querySelector('.leisure-exit');
const leisureContinue = document.querySelector('.leisure-continue');
const loopWindow = document.querySelector('.loop-window');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile = window.matchMedia('(max-width: 700px)');

const clamp = (x) => Math.max(0, Math.min(1, x));
const phase = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const mix = (a, b, t) => a + (b - a) * t;
const envelope = (p, a, b, c, d) => smooth(phase(p, a, b)) * (1 - smooth(phase(p, c, d)));
let start = 0;
let distance = 1;
let openingDistance = 1;
let archiveDistance = 1;
let workshopDistance = 1;
let scheduled = false;
let nextTarget = 'room';
let windowAnchor = { x: 0, y: 0 };

function updateThoughtSequence(r, arrival, isMobile, w, h) {
  // The book stays on the floor until it opens. Only then does the camera
  // follow the fall while the room and loose pages travel upwards together.
  const unfold = smooth(phase(r, .14, .28));
  const departure = smooth(phase(r, .31, .48));
  const baseBookWidth = w * (isMobile ? .24 : .135);
  const bookWidth = baseBookWidth * (1 + unfold * .9);
  const bookHeight = bookWidth * 2 / 3;
  const bookX = w * (isMobile ? .38 : .65);
  const shortMobile = isMobile && h <= 720;
  const bookBottom = h * (shortMobile ? .935 : .9);
  const gutterY = bookBottom - bookHeight * .52;
  questionBook.style.width = `${bookWidth}px`;
  questionBook.style.left = `${bookX - bookWidth / 2}px`;
  questionBook.style.top = `${bookBottom - bookHeight - departure * h * 1.4}px`;
  questionBook.style.transformOrigin = '50% 95%';
  questionBook.style.transform = `perspective(900px) rotateX(${35 * (1 - unfold)}deg)`;
  questionBook.style.opacity = arrival * (1 - smooth(phase(r, .35, .48)));
  // Dedicated drawn states keep the spine and nested paper contours connected.
  // The former split halves and oval opening are deliberately absent.
  bookResting.style.opacity = 1 - unfold;
  bookDepth.style.opacity = unfold;
  const opening = smooth(phase(r, .18, .31));
  pageTunnel.style.clipPath = `ellipse(${mix(bookWidth * .03, w * 1.8, opening)}px ${mix(bookHeight * .17, h * 1.6, opening)}px at ${bookX}px ${gutterY}px)`;
  pageTunnel.style.opacity = envelope(r, .18, .29, .66, .74);
  questionCopy.style.opacity = envelope(r, .1, .17, .27, .33);
  room.style.transform = `translate3d(0, ${-departure * 100}%, 0)`;
  room.style.opacity = arrival * (1 - smooth(phase(r, .29, .36)));

  const descent = smooth(phase(r, .28, .68));
  fallPages.style.opacity = envelope(r, .27, .34, .64, .72);
  const paperFrames = [
    [pageNearLeft, 18, 110 - descent * 180, -18 + descent * 14],
    [pageFarRight, 86, 160 - descent * 220, 16 - descent * 24],
    [pageNearRight, 95, 230 - descent * 280, -14 + descent * 30],
  ];
  paperFrames.forEach(([page, x, y, angle]) => {
    page.style.left = `${x}%`;
    page.style.top = `${y}%`;
    page.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  });

  const cameraCatchup = smooth(phase(r, .32, .45)) * (1 - smooth(phase(r, .55, .68)));
  const actorWidth = (isMobile ? Math.min(96, w * .21) : Math.min(190, w * .105)) * (1 + cameraCatchup * .5);
  const actorHeight = actorWidth * 1.5;
  const lean = smooth(phase(r, .18, .29));
  const readX = bookX + baseBookWidth * .64;
  const landingX = w * (isMobile ? .38 : .495);
  const landingY = h * (isMobile ? .883 : .853);
  let actorX = mix(readX, bookX, lean);
  const readingFloor = h * (shortMobile ? .915 : .88);
  let actorY = readingFloor;
  if (r > .28 && r <= .34) actorY = mix(readingFloor, h * .99, smooth(phase(r, .28, .34)));
  if (r > .34 && r <= .49) actorY = mix(h * .99, h * .72, smooth(phase(r, .34, .49)));
  if (r > .49) actorY = mix(h * .72, landingY, smooth(phase(r, .49, .68)));
  if (r > .29) actorX = mix(bookX, w * .6, smooth(phase(r, .29, .49)));
  if (r > .49) actorX = mix(w * .6, landingX, smooth(phase(r, .49, .68)));
  const fallingWeight = smooth(phase(r, .3, .308)) * (1 - smooth(phase(r, .66, .668)));
  const standingWeight = smooth(phase(r, .72, .735));
  thoughtTraveller.style.width = `${actorWidth}px`;
  thoughtTraveller.style.height = `${actorHeight}px`;
  thoughtTraveller.style.left = `${actorX}px`;
  thoughtTraveller.style.top = `${actorY}px`;
  thoughtTraveller.style.transform = `translate(-50%, -100%) rotate(${fallingWeight * mix(-10, 12, descent)}deg)`;
  thoughtTraveller.style.opacity = arrival * (1 - smooth(phase(r, .84, .9)));
  thoughtFalling.style.opacity = fallingWeight;
  thoughtStanding.style.opacity = standingWeight;
  thoughtReading.style.opacity = (1 - fallingWeight) * (1 - standingWeight);
  thoughtContact.style.left = `${actorX - actorWidth * .31}px`;
  thoughtContact.style.top = `${actorY - 2}px`;
  thoughtContact.style.width = `${actorWidth * .62}px`;
  thoughtContact.style.opacity = arrival * (1 - smooth(phase(r, .23, .3)) + envelope(r, .65, .69, .84, .9)) * .65;
}

function update() {
  scheduled = false;
  if (reducedMotion.matches) {
    world.style.transform = '';
    world.style.opacity = '1';
    entryLight.style.opacity = '0';
    threshold.style.opacity = '0';
    intro.style.transform = '';
    room.style.transform = '';
    room.style.opacity = '1';
    roomCopy.style.opacity = '1';
    questionBook.style.opacity = '0';
    pageTunnel.style.opacity = '0';
    fallPages.style.opacity = '0';
    questionCopy.style.opacity = '0';
    thoughtTraveller.style.opacity = '0';
    thoughtContact.style.opacity = '0';
    archive.style.transform = '';
    archive.style.opacity = '1';
    archiveBottom.style.opacity = '1';
    archiveBottom.inert = false;
    archiveCopy.style.opacity = '1';
    archiveCopy.style.transform = '';
    archiveIllustration.style.transform = '';
    researchStation.style.width = '';
    researchStation.style.right = '';
    researchStation.style.bottom = '';
    archiveTopics.style.opacity = '1';
    archiveCloseCopy.style.opacity = '0';
    archiveCopy.inert = false;
    archiveCloseCopy.inert = true;
    cabinet.style.opacity = '1';
    workshop.style.clipPath = '';
    workshop.style.opacity = '1';
    creationLight.style.opacity = '0';
    workshopCopy.style.opacity = '1';
    workshopCopy.style.transform = '';
    workshopContinue.style.opacity = '1';
    workshopContinue.inert = false;
    workshopArt.style.transform = '';
    terminal.style.width = '';
    terminal.style.right = '';
    terminal.style.bottom = '';
    doorway.style.opacity = '0';
    portalFrame.style.opacity = '0';
    colonyWorld.style.opacity = '1';
    colonyWorld.style.width = '';
    colonyWorld.style.bottom = '';
    colonyWorld.style.right = '';
    screenLight.style.opacity = '1';
    screenLight.style.left = '';
    screenLight.style.top = '';
    screenLight.style.right = '';
    screenLight.style.bottom = '';
    screenLight.style.width = '';
    screenLight.style.height = '';
    screenLight.style.transform = '';
    worldProjection.style.opacity = '0';
    workshop.inert = false;
    workshop.style.setProperty('--workshop-detail-opacity', 1);
    workshop.style.setProperty('--workshop-art-opacity', 1);
    projectSelector.inert = false;
    leisure.style.clipPath = '';
    leisure.style.visibility = 'visible';
    leisureCopy.style.opacity = '1';
    leisureObjects.style.opacity = '1';
    leisureObjects.style.transform = '';
    leisure.inert = false;
    leisureExit.style.opacity = '0';
    leisureContinue.style.opacity = '1';
    intro.inert = false;
    room.inert = false;
    archive.inert = false;
    nav.style.setProperty('--progress', 0);
    nav.classList.remove('in-depth');
    nextTarget = 'room';
    skipLabel.textContent = 'THE QUIET ROOM';
    skipButton.setAttribute('aria-label', 'Go to the quiet room');
    skipButton.hidden = false;
    return;
  }
  const overall = phase(window.scrollY, start, start + distance);
  // Each environment owns a fixed interval, so later scenes keep their pacing.
  const p = phase(window.scrollY, start, start + openingDistance);
  const research = phase(window.scrollY, start + openingDistance, start + openingDistance + archiveDistance);
  const making = phase(window.scrollY, start + openingDistance + archiveDistance, start + openingDistance + archiveDistance + workshopDistance);
  const playing = phase(window.scrollY, start + openingDistance + archiveDistance + workshopDistance, start + distance);
  const approachWindow = smooth(phase(p, .18, .59));
  const arrival = smooth(phase(p, .7, .8));
  const isMobile = mobile.matches;
  const viewportWidth = stage.offsetWidth;
  const viewportHeight = stage.offsetHeight;

  nav.style.setProperty('--progress', overall);
  const exteriorScale = 1 + approachWindow * .2;
  const fitCamera = (desired, origin, size) => Math.max((1 - exteriorScale) * (size - origin), Math.min((exteriorScale - 1) * origin, desired));
  const cameraX = fitCamera((viewportWidth * (isMobile ? .66 : .75) - windowAnchor.x) * approachWindow, windowAnchor.x, viewportWidth);
  const cameraY = fitCamera((viewportHeight * (isMobile ? .64 : .52) - windowAnchor.y) * approachWindow, windowAnchor.y, viewportHeight);
  world.style.transformOrigin = `${windowAnchor.x}px ${windowAnchor.y}px`;
  world.style.transform = `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${exteriorScale})`;
  // A restrained move keeps the painting sharp. The warm window matches the
  // interior lamp in a dissolve; the house and traveller share one ground plane.
  world.style.opacity = 1 - smooth(phase(p, .64, .72));
  intro.style.transform = isMobile
    ? `translate3d(0, ${-smooth(phase(p, .07, .23)) * 110}%, 0)`
    : `translate3d(${-smooth(phase(p, .07, .23)) * 110}%, 0, 0)`;

  const standingY = isMobile ? (window.innerHeight <= 720 ? 84.2 : 80) : 75;
  traveller.style.left = `${isMobile ? 40 : 53}%`;
  traveller.style.top = `${standingY}%`;
  traveller.style.transform = 'translate(-50%, -100%)';
  groundContact.style.opacity = .65;

  threshold.style.opacity = envelope(p, .22, .3, .47, .55);
  entryLight.style.left = `${mix(windowAnchor.x + cameraX, viewportWidth * .85, arrival)}px`;
  entryLight.style.top = `${mix(windowAnchor.y + cameraY, viewportHeight * (isMobile ? .65 : .4), arrival)}px`;
  entryLight.style.opacity = envelope(p, .44, .62, .72, .88) * .32;
  entryLight.style.transform = `translate(-50%, -50%) scale(${mix(.25, 2.8, smooth(phase(p, .4, .84)))})`;
  updateThoughtSequence(research, arrival, isMobile, viewportWidth, viewportHeight);
  roomCopy.style.opacity = smooth(phase(p, .8, .9)) * (1 - smooth(phase(research, .04, .1)));
  const archiveArrival = smooth(phase(research, .54, .66));
  archive.style.transform = 'none';
  archive.style.opacity = archiveArrival * (1 - smooth(phase(making, .08, .16)));
  archiveBottom.style.opacity = smooth(phase(research, .7, .76)) * (1 - smooth(phase(making, .02, .1)));
  archiveBottom.inert = research < .76;
  archiveCopy.style.opacity = envelope(research, .72, .78, .86, .93);
  archiveCopy.style.transform = `translateY(${(1 - smooth(phase(research, .72, .78))) * 20}px)`;
  const closeup = smooth(phase(research, .86, .995));
  // Lay out the imagery at its final pixel size. Scaling a cached, filtered layer
  // blurred the notebook even though the source image had enough resolution.
  const cameraScale = 1 + closeup * (isMobile ? .45 : .85);
  const originX = isMobile ? .73 : .82;
  const originY = isMobile ? .78 : .68;
  const baseRight = isMobile ? .03 : .01;
  const baseBottom = isMobile ? .12 : .15;
  researchStation.style.width = `${(isMobile ? 57 : 31) * cameraScale}%`;
  researchStation.style.right = `${(1 - originX - (1 - baseRight - originX) * cameraScale) * 100}%`;
  researchStation.style.bottom = `${(1 - originY - (1 - baseBottom - originY) * cameraScale) * 100 - closeup * (isMobile ? 8 : 2)}%`;
  cabinet.style.opacity = 1 - smooth(phase(research, .86, .93));
  const leaveStudy = 1 - smooth(phase(making, .04, .17));
  archiveCloseCopy.style.opacity = smooth(phase(research, .93, .99)) * leaveStudy;
  archiveTopics.style.opacity = smooth(phase(research, .95, .998)) * leaveStudy;
  archiveCopy.inert = research < .78 || research > .93;
  archiveCloseCopy.inert = research < .93;
  // Match the notebook's warm illumination to the monitor. Both environments
  // fill the frame during the dissolve, so no moving panel edge is exposed.
  const workshopArrival = smooth(phase(making, .16, .3));
  creationLight.style.opacity = envelope(making, .02, .12, .2, .35) * .42;
  workshop.style.clipPath = 'none';
  workshop.style.opacity = workshopArrival;
  workshopCopy.style.opacity = smooth(phase(making, .3, .4)) * (1 - smooth(phase(playing, .10, .27)));
  workshopContinue.style.opacity = smooth(phase(making, .32, .4)) * (1 - smooth(phase(playing, .1, .22)));
  workshopContinue.inert = making < .4 || playing >= .22;
  workshopCopy.style.transform = `translateY(${(1 - smooth(phase(making, .22, .36))) * 18}px)`;
  const emergence = smooth(phase(making, .38, .72));
  colonyWorld.style.opacity = smooth(phase(making, .38, .55));
  // Keep one physical scale: the island emerges from the monitor's screen,
  // and the doorway remains attached to its painted coordinates at every size.
  // Reserve room for the full island above the monitor, including a visible
  // gap and the reading area on phones. The two props share this scale.
  const artHeightLimit = isMobile ? (viewportHeight <= 720 ? .48 : .30) : .68;
  const terminalWidth = Math.min(viewportWidth * (isMobile ? .88 : .46), viewportHeight * artHeightLimit);
  const terminalRight = viewportWidth * (isMobile ? .06 : .03);
  const terminalBottom = viewportHeight * (isMobile ? .09 : .12);
  terminal.style.width = `${terminalWidth}px`;
  terminal.style.right = `${terminalRight}px`;
  terminal.style.bottom = `${terminalBottom}px`;
  workshopArt.style.setProperty('--terminal-contact-width', `${terminalWidth * .76}px`);
  workshopArt.style.setProperty('--terminal-contact-right', `${terminalRight + terminalWidth * .12}px`);
  workshopArt.style.setProperty('--terminal-contact-bottom', `${terminalBottom - 3}px`);
  const islandWidth = terminalWidth * mix(.32, .54, emergence);
  const islandHeight = islandWidth * 2 / 3;
  const islandRight = terminalRight + (terminalWidth - islandWidth) / 2;
  const islandBottom = terminalBottom + terminalWidth * 2 / 3 * mix(.48, 1.06, emergence);
  colonyWorld.style.width = `${islandWidth}px`;
  colonyWorld.style.bottom = `${islandBottom}px`;
  colonyWorld.style.right = `${islandRight}px`;
  // Both ends use the same live prop geometry as the doorway. The volume
  // is painted behind the island, never as an outline or a connecting wire.
  const sourceX = viewportWidth - terminalRight - terminalWidth * .5;
  const sourceY = viewportHeight - terminalBottom - terminalWidth * 2 / 3 * .72;
  const islandCenter = viewportWidth - islandRight - islandWidth / 2;
  const projectionTop = Math.min(sourceY - 1, viewportHeight - islandBottom - islandHeight * .1);
  const sourceHalfWidth = terminalWidth * .065;
  const topHalfWidth = islandWidth * .42;
  worldProjection.setAttribute('viewBox', `0 0 ${viewportWidth} ${viewportHeight}`);
  projectionVolume.setAttribute('d', `M ${sourceX - sourceHalfWidth} ${sourceY} L ${islandCenter - topHalfWidth} ${projectionTop} Q ${islandCenter} ${projectionTop - 12} ${islandCenter + topHalfWidth} ${projectionTop} L ${sourceX + sourceHalfWidth} ${sourceY} Q ${sourceX} ${sourceY + 12} ${sourceX - sourceHalfWidth} ${sourceY} Z`);
  worldProjection.style.opacity = smooth(phase(making, .48, .7)) * (1 - smooth(phase(playing, 0, .065)));
  screenLight.style.left = `${sourceX}px`;
  screenLight.style.top = `${sourceY}px`;
  screenLight.style.right = 'auto';
  screenLight.style.bottom = 'auto';
  screenLight.style.width = `${terminalWidth * .4}px`;
  screenLight.style.height = `${terminalWidth * .25}px`;
  screenLight.style.transform = 'translate(-50%, -50%)';
  const doorX = viewportWidth - islandRight - islandWidth * .56;
  const doorY = viewportHeight - islandBottom - islandHeight * .735;
  const doorWidth = islandWidth * .05;
  const doorHeight = islandHeight * .095;
  doorway.style.left = `${doorX - doorWidth / 2}px`;
  doorway.style.top = `${doorY - doorHeight / 2}px`;
  doorway.style.width = `${doorWidth}px`;
  doorway.style.height = `${doorHeight}px`;
  doorway.style.opacity = envelope(playing, .005, .055, .18, .42);
  const approach = smooth(phase(playing, .005, .2));
  workshopArt.style.transformOrigin = `${doorX}px ${doorY}px`;
  workshopArt.style.transform = `scale(${1 + approach * .12})`;
  screenLight.style.opacity = smooth(phase(making, .22, .4));
  workshop.inert = making < .31 || playing > .27;
  // On short phones, show the details first, then give the illustration its turn.
  const compactWorkshop = isMobile && window.innerHeight <= 720;
  const detailOpacity = compactWorkshop ? 1 - smooth(phase(making, .52, .7)) : 1;
  workshop.style.setProperty('--workshop-detail-opacity', detailOpacity);
  workshop.style.setProperty('--workshop-art-opacity', compactWorkshop ? smooth(phase(making, .52, .74)) : 1);
  projectSelector.inert = detailOpacity < .05;
  const leisureArrival = smooth(phase(playing, .07, .46));
  leisure.style.visibility = playing <= .07 ? 'hidden' : 'visible';
  // Expand the door as an arch, preserving its proportions rather than
  // stretching a small doorway into a floating rectangular panel.
  const portalWidth = doorWidth * Math.pow(viewportWidth * 3.6 / doorWidth, leisureArrival);
  const portalHeight = portalWidth * doorHeight / doorWidth;
  const portalLeft = doorX - portalWidth / 2;
  const portalTop = doorY - portalHeight / 2;
  const portalRight = viewportWidth - doorX - portalWidth / 2;
  const portalBottom = viewportHeight - doorY - portalHeight / 2;
  const portalRadius = portalWidth / 2;
  portalFrame.style.left = `${portalLeft}px`;
  portalFrame.style.top = `${portalTop}px`;
  portalFrame.style.width = `${portalWidth}px`;
  portalFrame.style.height = `${portalHeight}px`;
  portalFrame.style.borderRadius = `${portalRadius}px ${portalRadius}px 0 0`;
  portalFrame.style.opacity = envelope(playing, .065, .105, .38, .46);
  leisure.style.clipPath = leisureArrival === 1 ? 'none' : `inset(${portalTop}px ${portalRight}px ${portalBottom}px ${portalLeft}px round ${portalRadius}px ${portalRadius}px 0 0)`;
  leisureCopy.style.opacity = smooth(phase(playing, .33, .5));
  leisureObjects.style.opacity = smooth(phase(playing, .4, .56));
  leisureObjects.style.transform = `translateY(${(1 - smooth(phase(playing, .4, .56))) * 24}px)`;
  const quietReturn = smooth(phase(playing, .86, 1));
  leisureExit.style.opacity = quietReturn;
  leisureExit.style.setProperty('--signal-opacity', smooth(phase(playing, .91, .99)));
  leisureContinue.style.opacity = 1 - quietReturn;
  leisure.inert = playing < .46 || playing > .97;

  const atClosing = window.scrollY > start + journey.offsetHeight - 90;
  nav.classList.toggle('in-depth', atClosing || p > .18);
  const roomActive = p >= .9;
  chapter.textContent = atClosing ? '06 / AN OPEN CHANNEL' : playing > .24 ? '05 / THE GOOD KIND OF NOISE' : making > .24 ? '04 / THE WORKSHOP' : research > .7 ? '03 / THE ARCHIVE' : research > .28 ? '02 / DOWN THE RABBIT HOLE' : roomActive ? '02 / THE QUIET ROOM' : p > .28 ? '01 / COME IN' : '01 / A SMALL INTRODUCTION';
  intro.inert = p > .24;
  room.inert = p < .9 || research > .14;
  archive.inert = research < .75 || making > .12;
  nav.classList.toggle('at-closing', atClosing);
  nextTarget = atClosing ? 'start' : playing > .24 ? 'closing' : making > .24 ? 'leisure' : research > .74 ? 'workshop' : research > .22 ? 'archive' : roomActive ? 'question' : 'room';
  const nextLabels = { start: 'BEGIN AGAIN', room: 'THE QUIET ROOM', question: 'FOLLOW THE QUESTION', archive: 'INTO THE ARCHIVE', workshop: 'THE WORKSHOP', leisure: 'THE GOOD KIND OF NOISE', closing: 'AN OPEN CHANNEL' };
  skipLabel.textContent = nextLabels[nextTarget];
  skipButton.setAttribute('aria-label', nextTarget === 'question' ? 'Follow the question in the book' : `Go to ${nextLabels[nextTarget].toLowerCase()}`);
  // Chapters with their own action don't also show the same next action in the header.
  skipButton.hidden = atClosing || research > .74;
}

function measure() {
  start = journey.offsetTop;
  distance = Math.max(1, journey.offsetHeight - stage.offsetHeight);
  openingDistance = Math.min(distance, window.innerHeight * (mobile.matches ? 3.8 : 3.6));
  archiveDistance = Math.min(distance - openingDistance, window.innerHeight * (mobile.matches ? 4.8 : 4.6));
  workshopDistance = Math.min(distance - openingDistance - archiveDistance, window.innerHeight * 2.8);
  windowAnchor = { x: houseSite.offsetLeft + houseSite.offsetWidth * .61, y: houseSite.offsetTop + houseSite.offsetHeight * .59 };
  loopWindow.style.left = `${windowAnchor.x}px`;
  loopWindow.style.top = `${windowAnchor.y}px`;
  loopWindow.style.width = `${houseSite.offsetWidth * .35}px`;
  schedule();
}
function schedule() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
}
function goToProgress(p) {
  if (reducedMotion.matches) {
    (p > .5 ? room : journey).scrollIntoView({ behavior: 'auto' });
    return;
  }
  window.scrollTo({ top: start + openingDistance * p, behavior: 'smooth' });
}

document.querySelector('.begin-button').addEventListener('click', () => goToProgress(.32));
skipButton.addEventListener('click', () => {
  if (nextTarget === 'room') return goToProgress(.97);
  if (nextTarget === 'question') {
    if (reducedMotion.matches) return archive.scrollIntoView({ behavior: 'auto' });
    return window.scrollTo({ top: start + openingDistance + archiveDistance * .24, behavior: 'smooth' });
  }
  if (nextTarget === 'archive') {
    if (reducedMotion.matches) return archive.scrollIntoView({ behavior: 'auto' });
    return window.scrollTo({ top: start + openingDistance + archiveDistance * .79, behavior: 'smooth' });
  }
  if (nextTarget === 'workshop') return goToWorkshop();
  if (nextTarget === 'leisure') return goToLeisure();
  if (nextTarget === 'closing') return document.querySelector('.closing').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  restartJourney();
});
function goToWorkshop() {
  if (reducedMotion.matches) return workshop.scrollIntoView({ behavior: 'auto' });
  const workshopStart = start + openingDistance + archiveDistance;
  window.scrollTo({ top: workshopStart + workshopDistance * .78, behavior: 'smooth' });
}
document.querySelector('.archive-continue').addEventListener('click', goToWorkshop);
function goToLeisure() {
  if (reducedMotion.matches) return leisure.scrollIntoView({ behavior: 'auto' });
  const leisureStart = start + openingDistance + archiveDistance + workshopDistance;
  window.scrollTo({ top: leisureStart + (distance - openingDistance - archiveDistance - workshopDistance) * .6, behavior: 'smooth' });
}
document.querySelector('.workshop-continue').addEventListener('click', goToLeisure);
document.querySelector('.leisure-continue').addEventListener('click', () => {
  document.querySelector('.closing').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
});

const projectDescriptions = {
  colony: 'A Colony Sim with procedural world generation. I like seeing what happens when the rules start working together.',
  yumi: 'Yumi is a local AI companion I built around context. Another way of exploring how a connection can take shape.',
};
const projectButtons = document.querySelectorAll('[data-project]');
projectButtons.forEach(button => button.addEventListener('click', () => {
  projectButtons.forEach(item => item.setAttribute('aria-pressed', item === button ? 'true' : 'false'));
  document.querySelector('.project-description').textContent = projectDescriptions[button.dataset.project];
}));
const pastimeDescriptions = {
  games: 'FPS, hero shooters, survival, strategy. I like having something to figure out.',
  music: "My taste is all over the place. A good song doesn't need to fit a genre.",
  art: 'A few drawings I kept. Open my sketchbook.',
};
let sketchbookOpened = false;
let activePastime = 'games';
const pastimeButtons = document.querySelectorAll('[data-pastime]');
pastimeButtons.forEach(button => button.addEventListener('click', () => {
  activePastime = button.dataset.pastime;
  pastimeButtons.forEach(item => item.setAttribute('aria-pressed', item === button ? 'true' : 'false'));
  document.querySelector('.pastime-caption').textContent = pastimeDescriptions[button.dataset.pastime];
  const viewingArt = button.dataset.pastime === 'art';
  personalArt.hidden = !viewingArt;
  leisure.classList.toggle('is-viewing-art', viewingArt);
  if (viewingArt && sketchbookOpened) {
    sketchbookPages.inert = false;
    document.querySelector('.pastime-caption').textContent = 'Two drawings of mine. Choose a page for a closer look.';
  }
}));

sketchbookToggle.addEventListener('click', () => {
  sketchbookOpened = true;
  personalArt.classList.add('is-open');
  sketchbookToggle.setAttribute('aria-expanded', 'true');
  sketchbookToggle.inert = true;
  document.querySelector('.pastime-caption').textContent = 'Two drawings of mine. Choose a page for a closer look.';
  setTimeout(() => {
    if (activePastime === 'art') {
      sketchbookPages.inert = false;
      document.querySelector('.drawing-left').focus?.({ preventScroll: true });
    }
  }, reducedMotion.matches ? 0 : 650);
});

const drawingDescriptions = [
  'Drawing by Pedro: a figure with closed eyes, decorated hair and a heart motif, framed in black and gold.',
  'Drawing by Pedro: expressive characters in a dramatic composition, framed in black and gold.',
];
document.querySelectorAll('.sketchbook-pages a').forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
  if (typeof artViewer.showModal !== 'function') return;
  event.preventDefault();
  const index = Number(link.dataset.drawing);
  viewerImage.src = `assets/pedro-drawing-0${index + 1}.jpg`;
  viewerImage.alt = drawingDescriptions[index];
  document.querySelector('#viewer-caption').textContent = `Drawing 0${index + 1} — Pedro`;
  artViewer.showModal();
  document.body.classList.add('art-open');
}));
document.querySelector('.viewer-close').addEventListener('click', () => artViewer.close());
artViewer.addEventListener('click', event => { if (event.target === artViewer) artViewer.close(); });
artViewer.addEventListener('close', () => document.body.classList.remove('art-open'));

let restarting = false;
function restartJourney() {
  if (restarting) return;
  if (reducedMotion.matches) { window.scrollTo({ top: 0, behavior: 'auto' }); document.querySelector('.begin-button').focus?.({ preventScroll: true }); return; }
  restarting = true;
  document.body.classList.add('is-restarting');
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    update();
    setTimeout(() => {
      document.body.classList.remove('is-restarting');
      document.querySelector('.begin-button').focus?.({ preventScroll: true });
      restarting = false;
    }, 120);
  }, 420);
}
document.querySelector('.restart').addEventListener('click', restartJourney);
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', measure);
reducedMotion.addEventListener('change', measure);
document.fonts.ready.then(measure);
window.addEventListener('load', measure);
measure();
