#!/usr/bin/env python3
"""Generate all 秘境寻宝 (Mystic Realm Treasure Hunt) scene images via Krea.ai API."""

import requests
import time
import json
import os
import sys

API_BASE = "https://api.krea.ai"
API_TOKEN = os.environ.get("KREA_API_TOKEN", "")
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "scenes"))
RESULTS_FILE = os.path.join(OUTPUT_DIR, "generated_images.json")

os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# All 22 scenes with English prompts for optimal image generation quality
SCENES = [
    # ========== 1. 残局博弈 (Wisdom+Fortune Check) ==========
    {"id": "chess_01", "name": "石亭黑白残局",
     "prompt": "Ancient Chinese wuxia scene: a stone pavilion hidden in misty bamboo forest, an unfinished Go board game on a moss-covered stone table, black and white stones in deadly formation, pine needles falling, wind blowing through, dramatic lighting, cinematic composition, ink painting style"},
    {"id": "chess_02", "name": "八卦阵图",
     "prompt": "Ancient Chinese wuxia scene: a massive stone wall carved with a glowing crimson Bagua Eight Trigrams formation, red energy qi flowing through mystical Taoist patterns, dark cave atmosphere, supernatural lighting, cinematic, ink painting style"},
    {"id": "chess_03", "name": "内力简卷",
     "prompt": "Ancient Chinese wuxia scene: several ancient scrolls intertwined and suspended in mid-air, emanating mysterious blue inner energy force, old library or cave, dust particles floating in light beams, magical atmosphere, cinematic, ink painting style"},

    # ========== 2. 献祭奉献 (HP Sacrifice) ==========
    {"id": "sacrifice_01", "name": "雪白猿猴求救",
     "prompt": "Ancient Chinese wuxia scene: a wounded snow-white ape clutching its bleeding abdomen in a mystical mountain cave, reaching out one hand begging for help, emotional, dramatic lighting, ancient forest atmosphere, cinematic, ink painting style"},
    {"id": "sacrifice_02", "name": "中毒高僧",
     "prompt": "Ancient Chinese wuxia scene: a dying elderly Buddhist monk poisoned with purple veins visible on his face, sitting in lotus meditation position under an ancient tree, serene despite dying, autumn leaves falling, spiritual atmosphere, cinematic, ink painting style"},
    {"id": "sacrifice_03", "name": "镇魂女尸",
     "prompt": "Ancient Chinese wuxia scene: a female corpse in white burial clothes about to transform into a jiangshi hopping vampire, needing soul suppression, eerie blue ghost light, dark tomb chamber, talisman papers floating, horror wuxia atmosphere, cinematic"},

    # ========== 3. 绝力破坏 (Strength+Constitution Check) ==========
    {"id": "brute_01", "name": "诡异金身佛像",
     "prompt": "Ancient Chinese wuxia scene: an eerie giant golden Buddha statue with a sinister expression blocking a cave passage, glowing ominously, dust and debris, dramatic confrontation, temple ruins, cinematic lighting, ink painting style"},
    {"id": "brute_02", "name": "断龙石",
     "prompt": "Ancient Chinese wuxia scene: a massive dragon-sealing stone slab completely blocking an underground tunnel passage, carved with ancient dragon motifs, torches flickering on walls, desperate atmosphere, cinematic, ink painting style"},
    {"id": "brute_03", "name": "铁甲地衣蟹",
     "prompt": "Ancient Chinese wuxia scene: a dark underground cave floor covered with a swarm of armored iron-shell crabs and lichen, blocking the path forward, glowing eyes in darkness, creepy crawling horror atmosphere, cinematic"},

    # ========== 4. 遗迹承恩 (Constitution+Spirit Check) ==========
    {"id": "relic_01", "name": "剑冢枯骨",
     "prompt": "Ancient Chinese wuxia scene: a sword tomb with skeletal remains of a legendary swordsman leaning against a massive rusted sword, final writings carved deeply into the stone wall, scattered swords stuck in ground, solemn and epic atmosphere, dramatic lighting, cinematic, ink painting style"},
    {"id": "relic_02", "name": "仙女舞剑图",
     "prompt": "Ancient Chinese wuxia scene: at the bottom of a freezing cold spring, a celestial fairy maiden sword dance painting visible through crystal clear water, ethereal blue light, ice crystals, mystical and beautiful atmosphere, cinematic, ink painting style"},
    {"id": "relic_03", "name": "古铜香炉",
     "prompt": "Ancient Chinese wuxia scene: an ancient bronze incense burner still lit with exotic fragrant smoke curling up, placed next to a meditation cushion in an abandoned temple, divine light beam from above, peaceful spiritual atmosphere, cinematic, ink painting style"},

    # ========== 5. 幻境审视 (Wisdom+Will Check) ==========
    {"id": "illusion_01", "name": "冰魔之镜",
     "prompt": "Ancient Chinese wuxia scene: a massive mirror made of dark ice with a demonic face within, tempting the viewer to give up their mortal form, frozen cave, eerie blue reflections, supernatural horror wuxia atmosphere, cinematic"},
    {"id": "illusion_02", "name": "桃花林神兵",
     "prompt": "Ancient Chinese wuxia scene: a beautiful peach blossom forest in full bloom, divine weapons and treasures hanging from branches within easy reach, pink petals falling, dreamy but deceptive atmosphere, temptation and danger, cinematic, ink painting style"},
    {"id": "illusion_03", "name": "修罗血海",
     "prompt": "Ancient Chinese wuxia scene: a blood-red sea of the asura realm, surrounded by countless vengeful spirits of past victims, dark crimson sky, storm and lightning, terrifying yet epic Buddhist hell atmosphere, cinematic"},

    # ========== 6. 轻巧之极 (Agility Check) ==========
    {"id": "trap_01", "name": "连弩陷阱甬道",
     "prompt": "Ancient Chinese wuxia scene: a long stone corridor filled with deadly repeating crossbow traps, arrows embedded in walls and floor, pressure plates visible, narrow and dangerous, action atmosphere, cinematic, ink painting style"},
    {"id": "trap_02", "name": "深渊断桥",
     "prompt": "Ancient Chinese wuxia scene: a broken rope bridge over a bottomless abyss in a mountain pass, howling wind, extremely wet and slippery moss-covered planks, mist below, vertigo-inducing height, perilous atmosphere, cinematic"},
    {"id": "trap_03", "name": "流沙密室",
     "prompt": "Ancient Chinese wuxia scene: an underground chamber rapidly filling with quicksand about to reach the ceiling, only moments from drowning, desperate race against time, sand pouring from walls, claustrophobic, intense survival atmosphere, cinematic"},

    # ========== 四大背景主题 ==========
    {"id": "bg_forest", "name": "密林入口",
     "prompt": "Ancient Chinese wuxia scene: entrance to a dense mysterious forest with ancient twisted trees, faint path disappearing into darkness, glowing spirit lights, fog and mist, adventure awaits, cinematic landscape, ink painting style"},
    {"id": "bg_peak", "name": "孤峰绝顶",
     "prompt": "Ancient Chinese wuxia scene: a solitary mountain peak piercing through the clouds, a lone martial artist silhouette standing at the edge, sea of clouds below, epic wuxia landscape, sunrise golden light, cinematic, ink painting style"},
    {"id": "bg_temple", "name": "废寺遗迹",
     "prompt": "Ancient Chinese wuxia scene: an abandoned ruined Buddhist temple in the wilderness, broken statues, collapsed roofs, nature reclaiming stone, mysterious ancient aura, overgrown with vines, atmospheric, cinematic, ink painting style"},
    {"id": "bg_dungeon", "name": "地宫入口",
     "prompt": "Ancient Chinese wuxia scene: the entrance to an ancient underground palace, massive stone doors with intricate carvings slightly open, stairs descending into darkness, torches barely lighting the way, mysterious and foreboding, cinematic"},
]


def submit_job(scene):
    """Submit an image generation job."""
    payload = {
        "prompt": scene["prompt"],
        "width": 1024,
        "height": 768,
        "steps": 28
    }
    resp = requests.post(
        f"{API_BASE}/generate/image/bfl/flux-1-dev",
        headers=HEADERS,
        json=payload,
        timeout=30
    )
    resp.raise_for_status()
    data = resp.json()
    scene["job_id"] = data["job_id"]
    scene["status"] = data["status"]
    return scene


def poll_job(scene):
    """Poll a job until completion."""
    resp = requests.get(
        f"{API_BASE}/jobs/{scene['job_id']}",
        headers=HEADERS,
        timeout=10
    )
    resp.raise_for_status()
    data = resp.json()
    if data["status"] == "completed":
        scene["url"] = data["result"]["urls"][0]
        scene["status"] = "completed"
        return True
    elif data["status"] == "failed":
        scene["status"] = "failed"
        return True
    return False


def download_image(scene):
    """Download generated image."""
    if not scene.get("url"):
        return False
    filename = f"{scene['id']}.png"
    filepath = os.path.join(OUTPUT_DIR, filename)
    resp = requests.get(scene["url"], timeout=60)
    resp.raise_for_status()
    with open(filepath, "wb") as f:
        f.write(resp.content)
    scene["file"] = filename
    return True


def main():
    print(f"Total scenes to generate: {len(SCENES)}")
    print(f"Output directory: {OUTPUT_DIR}")
    print()

    # Step 1: Submit all jobs
    print("=== Submitting Jobs ===")
    for scene in SCENES:
        # Skip if image already exists
        filename = f"{scene['id']}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(filepath):
            print(f"[{scene['id']}] Skipped (already exists): {scene['name']}")
            scene["status"] = "completed"
            continue
        try:
            submit_job(scene)
            print(f"[{scene['id']}] Submitted: {scene['name']} -> {scene['job_id']}")
        except Exception as e:
            print(f"[{scene['id']}] SUBMIT FAILED: {scene['name']} -> {e}")
    print()

    # Step 2: Poll all jobs
    print("=== Polling for Completion ===")
    pending = [s for s in SCENES if s.get("job_id")]
    max_attempts = 60
    for attempt in range(max_attempts):
        still_pending = []
        for scene in pending:
            if scene.get("status") in ("completed", "failed"):
                continue
            try:
                if poll_job(scene):
                    if scene["status"] == "completed":
                        print(f"[{scene['id']}] DONE: {scene['name']}")
                    else:
                        print(f"[{scene['id']}] FAILED: {scene['name']}")
                else:
                    still_pending.append(scene)
            except Exception as e:
                still_pending.append(scene)
        pending = still_pending
        if not pending:
            break
        done = len([s for s in SCENES if s.get("status") in ("completed", "failed")])
        print(f"Polling... ({done}/{len(SCENES)} done)")
        time.sleep(3)
    print()

    # Step 3: Download images
    print("=== Downloading Images ===")
    success = 0
    for scene in SCENES:
        if scene.get("url"):
            try:
                download_image(scene)
                success += 1
                print(f"[{scene['id']}] Downloaded: {scene['file']}")
            except Exception as e:
                print(f"[{scene['id']}] Download FAILED: {e}")

    # Step 4: Save results
    results = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "total": len(SCENES),
        "success": success,
        "scenes": [{k: v for k, v in s.items() if k != "prompt"} for s in SCENES]
    }
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print()
    print(f"=== Complete ===")
    print(f"Generated: {success}/{len(SCENES)} images")
    print(f"Results: {RESULTS_FILE}")
    print(f"Images: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
