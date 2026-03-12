// src/AssetLoader.js
// Asset loading (SYSTEM layer).
//
// Responsibilities:
// - Load image assets (tiles, spritesheets, UI, backgrounds) during preload()
// - Build animation definitions from tuning.json (including "hold": true → Infinity)
// - Return a normalized assets bundle used by Game/Level/entities
//
// Non-goals:
// - Does NOT create sprites, groups, or physics bodies
// - Does NOT decide game rules or world state
// - Does NOT draw anything to the screen
//
// Architectural notes:
// - main.js calls loadAssets() in preload().
// - Keeping assets + animation definitions separate supports data-driven tuning.

export async function loadAssets(levelPkg, tuningDoc) {
  // ---- images ----
  // IMPORTANT:
  // loadImage() is "preload-safe" only if p5 is actually tracking it inside preload().
  // To make this robust even if your boot flow uses async/await, we wrap loadImage in a Promise.
  const playerImg = await loadImageAsync("assets/player_Idle.png");
  const boarImg = await loadImageAsync("assets/enemy_Run.png");
  const leafImg = await loadImageAsync("assets/leaf_Owlet_Walk.png");
  const fireImg = await loadImageAsync("assets/fireSpriteSheet.png");

  const groundTileImg = await loadImageAsync("assets/swamp_ground.png");
  const groundTileDeepImg = await loadImageAsync("assets/swamp_ground_deep.png");
  const platformLCImg = await loadImageAsync("assets/swamp_platform_l.png");
  const platformRCImg = await loadImageAsync("assets/swamp_platform_r.png");
  const wallLImg = await loadImageAsync("assets/swamp_wall_l.png");
  const wallRImg = await loadImageAsync("assets/swamp_wall_r.png");

  const fontImg = await loadImageAsync("assets/bitmapFont.png");

  // Backgrounds (keys should match levels.json parallaxLayers[].key)
  // If levelPkg provides a parallax layer list with { key, src }, prefer that.
  // Otherwise fall back to the default 3-layer set.
  const backgrounds = await loadBackgrounds(levelPkg);

  // ---- anis ----
  // Prefer tuning-driven animations if present, else fallback to monolith defaults.
  // ALSO: inject a spriteSheet reference by default so addAnis never tries to load "undefined".
  // Each player animation has its own img, so no global spriteSheet injection needed.
  let playerAnis = buildAnis(tuningDoc?.player?.animations, defaultPlayerAnis(), {});

  // Each enemy animation has its own img, so no global spriteSheet injection needed.
  let boarAnis = buildAnis(tuningDoc?.boar?.animations, defaultBoarAnis(), {});

  // If tuning.json uses per-animation "img" fields (strings), preload them here and replace with p5.Images.
  // This prevents runtime XHRs and avoids /undefined crashes.
  playerAnis = await resolveAniImages(playerAnis, "player");
  boarAnis = await resolveAniImages(boarAnis, "boar");

  // Guard rails: fail early with a helpful message instead of crashing inside p5/p5play.
  validateAssets({
    playerImg,
    boarImg,
    leafImg,
    fireImg,
    groundTileImg,
    groundTileDeepImg,
    platformLCImg,
    platformRCImg,
    wallLImg,
    wallRImg,
    fontImg,
    backgrounds,
    playerAnis,
    boarAnis,
  });

  return {
    playerImg,
    boarImg,
    leafImg,
    fireImg,

    groundTileImg,
    groundTileDeepImg,
    platformLCImg,
    platformRCImg,
    wallLImg,
    wallRImg,

    fontImg,
    backgrounds,

    playerAnis,
    boarAnis,
  };
}

/**
 * Merge/normalize anis data:
 * - converts { hold:true } -> frameDelay: Infinity
 * - injects defaults (like spriteSheet) if not provided in tuning
 * - keeps other keys intact
 */
function buildAnis(tuningAnis, fallbackAnis, inject = {}) {
  const src = tuningAnis && typeof tuningAnis === "object" ? tuningAnis : fallbackAnis;
  const out = {};

  for (const [name, def] of Object.entries(src)) {
    // If tuning provides null/undefined for an animation by mistake, skip it safely.
    if (!def || typeof def !== "object") continue;

    const d = { ...inject, ...def };

    // JSON-safe "hold" -> Infinity
    if (d.hold === true) {
      d.frameDelay = Infinity;
      delete d.hold;
    }

    // If tuning accidentally sets img to undefined/empty, remove it so p5play doesn't loadImage(undefined).
    if ("img" in d && (d.img === undefined || d.img === null || d.img === "")) {
      delete d.img;
    }

    // If spriteSheet is missing, keep it missing (Level/Entity might set it),
    // BUT our loadAssets() injects spriteSheet by default for player/boar so it's usually present.
    out[name] = d;
  }

  return out;
}

// --- fallback anis (Converted_Vampire sprite sheets) ---
function defaultPlayerAnis() {
  return {
    idle:      { img: "assets/player_Idle.png",     frames: 5, frameDelay: 10 },
    run:       { img: "assets/player_Run.png",      frames: 8, frameDelay: 3  },
    walk:      { img: "assets/player_Walk.png",     frames: 8, frameDelay: 5  },
    jump:      { img: "assets/player_Jump.png",     frames: 7, frameDelay: Infinity, frame: 0 },
    attack:    { img: "assets/player_Attack_1.png", frames: 5, frameDelay: 2  },
    hurtPose:  { img: "assets/player_Hurt.png",     frames: 1, frameDelay: Infinity, frame: 0 },
    death:     { img: "assets/player_Dead.png",     frames: 8, frameDelay: 16 },
    protect:   { img: "assets/player_Protect.png",  frames: 2, frameDelay: 8  },
  };
}

// --- fallback anis (Vampire_Girl sprite sheets) ---
// Active AI states:   run | throwPose | death
// Defined but unused: idle | walk | jump | attack1-4 | bloodCharge1-4 (ready for AI expansion)
function defaultBoarAnis() {
  return {
    // ---- AI-driven animations ----
    run:       { img: "assets/enemy_Run.png",  frames: 6, frameDelay: 3 },
    throwPose: { img: "assets/enemy_Hurt.png", frames: 2, frameDelay: Infinity, frame: 0 },
    death:     { img: "assets/enemy_Dead.png", frames: 10, frameDelay: 12 },

    // ---- Defined but not yet triggered by AI ----
    idle:         { img: "assets/enemy_Idle.png",           frames: 5, frameDelay: 10 },
    walk:         { img: "assets/enemy_Walk.png",           frames: 6, frameDelay: 5  },
    jump:         { img: "assets/enemy_Jump.png",           frames: 6, frameDelay: Infinity, frame: 0 },
    attack1:      { img: "assets/enemy_Attack_1.png",       frames: 5, frameDelay: 2  },
    attack2:      { img: "assets/enemy_Attack_2.png",       frames: 4, frameDelay: 2  },
    attack3:      { img: "assets/enemy_Attack_3.png",       frames: 2, frameDelay: 3  },
    attack4:      { img: "assets/enemy_Attack_4.png",       frames: 5, frameDelay: 2  },
    bloodCharge1: { img: "assets/enemy_Blood_Charge_1.png", frames: 4, frameDelay: 4  },
    bloodCharge2: { img: "assets/enemy_Blood_Charge_2.png", frames: 4, frameDelay: 4  },
    bloodCharge3: { img: "assets/enemy_Blood_Charge_3.png", frames: 4, frameDelay: 4  },
    bloodCharge4: { img: "assets/enemy_Blood_Charge_4.png", frames: 5, frameDelay: 4  },
  };
}

// ------------------------
// helpers
// ------------------------

function loadImageAsync(path) {
  if (!path) {
    // This is the exact scenario that led to GET /undefined.
    throw new Error(`[AssetLoader] loadImageAsync called with invalid path: ${path}`);
  }
  return new Promise((resolve, reject) => {
    try {
      loadImage(
        path,
        (img) => resolve(img),
        (err) => reject(new Error(`[AssetLoader] Failed to load image "${path}": ${err}`)),
      );
    } catch (e) {
      reject(new Error(`[AssetLoader] loadImage("${path}") threw: ${e?.message ?? e}`));
    }
  });
}

async function loadBackgrounds(levelPkg) {
  // If levels.json supplies parallaxLayers with keys and sources, load them dynamically.
  // Expected shape (flexible):
  // levelPkg.parallaxLayers = [{ key:"bgFar", src:"assets/..." }, ...]
  // Your levels.json stores parallax in: level.view.parallax
  const layers = levelPkg?.level?.view?.parallax || levelPkg?.parallaxLayers;
  
  if (Array.isArray(layers) && layers.length > 0) {
    const bg = {};
    for (const layer of layers) {
      const key = layer?.key;
      const src = layer?.src || layer?.path || layer?.img;
      if (!key) continue;

      // If src is missing, keep it undefined but DON'T crash here;
      // validation will catch it with a clean error.
      bg[key] = src ? await loadImageAsync(src) : undefined;
    }
    return bg;
  }

  // Default fallback set
  return {
    bgFar: await loadImageAsync("assets/background_layer_1.png"),
    bgMid: await loadImageAsync("assets/background_layer_2.png"),
    bgFore: await loadImageAsync("assets/background_layer_3.png"),
  };
}

async function resolveAniImages(anis, label = "entity") {
  if (!anis || typeof anis !== "object") return anis;

  // If tuning uses { img: "assets/some.png" } per animation, convert those strings to p5.Images now.
  const out = {};
  for (const [name, def] of Object.entries(anis)) {
    if (!def || typeof def !== "object") continue;

    const d = { ...def };

    // If img is a string, preload it and replace with the loaded image.
    if (typeof d.img === "string") {
      if (!d.img) {
        delete d.img;
      } else {
        d.img = await loadImageAsync(d.img);
      }
    }

    // If spriteSheet is accidentally a string path, preload it too.
    // (This makes tuning flexible and prevents p5play from trying to load "undefined".)
    if (typeof d.spriteSheet === "string") {
      if (!d.spriteSheet) {
        throw new Error(`[AssetLoader] ${label}.${name}.spriteSheet is an empty string`);
      }
      d.spriteSheet = await loadImageAsync(d.spriteSheet);
    }

    // If img exists but is still undefined/null, remove it to avoid loadImage(undefined).
    if ("img" in d && (d.img === undefined || d.img === null)) {
      delete d.img;
    }

    out[name] = d;
  }

  return out;
}

function validateAssets(bundle) {
  const mustHaveImages = [
    "playerImg",
    "boarImg",
    "leafImg",
    "fireImg",
    "groundTileImg",
    "groundTileDeepImg",
    "platformLCImg",
    "platformRCImg",
    "wallLImg",
    "wallRImg",
    "fontImg",
  ];

  for (const key of mustHaveImages) {
    if (!bundle[key]) {
      throw new Error(`[AssetLoader] Missing required image: ${key}`);
    }
  }

  if (!bundle.backgrounds || typeof bundle.backgrounds !== "object") {
    throw new Error(`[AssetLoader] Missing backgrounds object`);
  }

  // Background values should all be defined images.
  for (const [k, v] of Object.entries(bundle.backgrounds)) {
    if (!v) {
      throw new Error(
        `[AssetLoader] Background "${k}" is missing/undefined (check levels.json parallaxLayers or default bg paths)`,
      );
    }
  }

  // Anis sanity checks (prevents p5play from crashing deep in addAnis/loadImage).
  const checkAnis = (anis, label) => {
    if (!anis || typeof anis !== "object") {
      throw new Error(`[AssetLoader] Missing ${label}Anis object`);
    }
    for (const [name, def] of Object.entries(anis)) {
      if (!def || typeof def !== "object") {
        throw new Error(`[AssetLoader] ${label}Anis.${name} is invalid`);
      }
      // If an ani uses spriteSheet rows/frames, spriteSheet must exist at runtime.
      // We inject spriteSheet by default, so this catches tuning mistakes.
      if (!def.spriteSheet && !def.img) {
        // Allow cases where your entity sets sprite.spriteSheet later,
        // but this warning is *usually* what causes the /undefined crash.
        // Throwing here keeps the failure obvious.
        throw new Error(
          `[AssetLoader] ${label}Anis.${name} has no spriteSheet and no img. ` +
            `This can cause addAnis() to loadImage(undefined).`,
        );
      }
      if ("img" in def && (def.img === undefined || def.img === null)) {
        throw new Error(`[AssetLoader] ${label}Anis.${name}.img is undefined/null`);
      }
    }
  };

  checkAnis(bundle.playerAnis, "player");
  checkAnis(bundle.boarAnis, "boar");
}
