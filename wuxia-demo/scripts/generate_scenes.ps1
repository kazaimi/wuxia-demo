# Krea.ai Image Generator for 秘境寻宝 (Mystic Realm Treasure Hunt)
# Generates images for all 22 scenes: 6 mechanisms × 3 variants + 4 background themes
$ErrorActionPreference = "Stop"

$API_BASE = "https://api.krea.ai"
$API_TOKEN = "b555903d-b80d-4926-a8ff-c0aab58487d3:E75HfzHkOGyybzsmnv-y6Lqp8TABLS6l"
$OUTPUT_DIR = "C:\Users\Alex.Xu\Desktop\working vault\research\Antigravity projects\wuxia-demo\public\scenes"
$RESULTS_FILE = "$OUTPUT_DIR\generated_images.json"

if (-not (Test-Path $OUTPUT_DIR)) { New-Item -ItemType Directory -Force -Path $OUTPUT_DIR | Out-Null }

# All 22 scenes with English prompts for image generation
$scenes = @(
    # ========== 1. 残局博弈 (Wisdom+Fortune Check) ==========
    @{id="chess_01"; name="石亭黑白残局"; prompt="Ancient Chinese wuxia scene: a stone pavilion hidden in misty bamboo forest, an unfinished Go board game on a moss-covered stone table, black and white stones in deadly formation, pine needles falling, wind blowing through, dramatic lighting, cinematic composition, ink painting style"},
    @{id="chess_02"; name="八卦阵图"; prompt="Ancient Chinese wuxia scene: a massive stone wall carved with a glowing crimson Bagua Eight Trigrams formation, red energy qi flowing through mystical Taoist patterns, dark cave atmosphere, supernatural lighting, cinematic, ink painting style"},
    @{id="chess_03"; name="内力简卷"; prompt="Ancient Chinese wuxia scene: several ancient scrolls intertwined and suspended in mid-air, emanating mysterious blue inner energy force, old library or cave, dust particles floating in light beams, magical atmosphere, cinematic, ink painting style"},

    # ========== 2. 献祭奉献 (HP Sacrifice) ==========
    @{id="sacrifice_01"; name="雪白猿猴求救"; prompt="Ancient Chinese wuxia scene: a wounded snow-white ape clutching its bleeding abdomen in a mystical mountain cave, reaching out one hand begging for help, emotional, dramatic lighting, ancient forest atmosphere, cinematic, ink painting style"},
    @{id="sacrifice_02"; name="中毒高僧"; prompt="Ancient Chinese wuxia scene: a dying elderly Buddhist monk poisoned with purple veins visible on his face, sitting in lotus meditation position under an ancient tree, serene despite dying, autumn leaves falling, spiritual atmosphere, cinematic, ink painting style"},
    @{id="sacrifice_03"; name="镇魂女尸"; prompt="Ancient Chinese wuxia scene: a female corpse in white burial clothes about to transform into a jiangshi hopping vampire, needing soul suppression, eerie blue ghost light, dark tomb chamber, talisman papers floating, horror wuxia atmosphere, cinematic"},

    # ========== 3. 绝力破坏 (Strength+Constitution Check) ==========
    @{id="brute_01"; name="诡异金身佛像"; prompt="Ancient Chinese wuxia scene: an eerie giant golden Buddha statue with a sinister expression blocking a cave passage, glowing ominously, dust and debris, dramatic confrontation, temple ruins, cinematic lighting, ink painting style"},
    @{id="brute_02"; name="断龙石"; prompt="Ancient Chinese wuxia scene: a massive dragon-sealing stone slab completely blocking an underground tunnel passage, carved with ancient dragon motifs, torches flickering on walls, desperate atmosphere, cinematic, ink painting style"},
    @{id="brute_03"; name="铁甲地衣蟹"; prompt="Ancient Chinese wuxia scene: a dark underground cave floor covered with a swarm of armored iron-shell crabs and lichen, blocking the path forward, glowing eyes in darkness, creepy crawling horror atmosphere, cinematic"},

    # ========== 4. 遗迹承恩 (Constitution+Spirit Check) ==========
    @{id="relic_01"; name="剑冢枯骨"; prompt="Ancient Chinese wuxia scene: a sword tomb with skeletal remains of a legendary swordsman leaning against a massive rusted sword, final writings carved deeply into the stone wall, scattered swords stuck in ground, solemn and epic atmosphere, dramatic lighting, cinematic, ink painting style"},
    @{id="relic_02"; name="仙女舞剑图"; prompt="Ancient Chinese wuxia scene: at the bottom of a freezing cold spring, a celestial fairy maiden sword dance painting visible through crystal clear water, ethereal blue light, ice crystals, mystical and beautiful atmosphere, cinematic, ink painting style"},
    @{id="relic_03"; name="古铜香炉"; prompt="Ancient Chinese wuxia scene: an ancient bronze incense burner still lit with exotic fragrant smoke curling up, placed next to a meditation cushion in an abandoned temple, divine light beam from above, peaceful spiritual atmosphere, cinematic, ink painting style"},

    # ========== 5. 幻境审视 (Wisdom+Will Check) ==========
    @{id="illusion_01"; name="冰魔之镜"; prompt="Ancient Chinese wuxia scene: a massive mirror made of dark ice with a demonic face within, tempting the viewer to give up their mortal form, frozen cave, eerie blue reflections, supernatural horror wuxia atmosphere, cinematic"},
    @{id="illusion_02"; name="桃花林神兵"; prompt="Ancient Chinese wuxia scene: a beautiful peach blossom forest in full bloom, divine weapons and treasures hanging from branches within easy reach, pink petals falling, dreamy but deceptive atmosphere, temptation and danger, cinematic, ink painting style"},
    @{id="illusion_03"; name="修罗血海"; prompt="Ancient Chinese wuxia scene: a blood-red sea of the asura realm, surrounded by countless vengeful spirits of past victims, dark crimson sky, storm and lightning, terrifying yet epic Buddhist hell atmosphere, cinematic"},

    # ========== 6. 轻巧之极 (Agility Check) ==========
    @{id="trap_01"; name="连弩陷阱甬道"; prompt="Ancient Chinese wuxia scene: a long stone corridor filled with deadly repeating crossbow traps, arrows embedded in walls and floor, pressure plates visible, narrow and dangerous, action atmosphere, cinematic, ink painting style"},
    @{id="trap_02"; name="深渊断桥"; prompt="Ancient Chinese wuxia scene: a broken rope bridge over a bottomless abyss in a mountain pass, howling wind, extremely wet and slippery moss-covered planks, mist below, vertigo-inducing height, perilous atmosphere, cinematic"},
    @{id="trap_03"; name="流沙密室"; prompt="Ancient Chinese wuxia scene: an underground chamber rapidly filling with quicksand about to reach the ceiling, only moments from drowning, desperate race against time, sand pouring from walls, claustrophobic, intense survival atmosphere, cinematic"},

    # ========== 四大背景主题 ==========
    @{id="bg_forest"; name="密林入口"; prompt="Ancient Chinese wuxia scene: entrance to a dense mysterious forest with ancient twisted trees, faint path disappearing into darkness, glowing spirit lights, fog and mist, adventure awaits, cinematic landscape, ink painting style"},
    @{id="bg_peak"; name="孤峰绝顶"; prompt="Ancient Chinese wuxia scene: a solitary mountain peak piercing through the clouds, a lone martial artist silhouette standing at the edge, sea of clouds below, epic wuxia landscape, sunrise golden light, cinematic, ink painting style"},
    @{id="bg_temple"; name="废寺遗迹"; prompt="Ancient Chinese wuxia scene: an abandoned ruined Buddhist temple in the wilderness, broken statues, collapsed roofs, nature reclaiming stone, mysterious ancient aura, overgrown with vines, atmospheric, cinematic, ink painting style"},
    @{id="bg_dungeon"; name="地宫入口"; prompt="Ancient Chinese wuxia scene: the entrance to an ancient underground palace, massive stone doors with intricate carvings slightly open, stairs descending into darkness, torches barely lighting the way, mysterious and foreboding, cinematic"}
)

Write-Output "Total scenes to generate: $($scenes.Count)"
Write-Output "Output directory: $OUTPUT_DIR"
Write-Output ""

# Submit all jobs
$jobs = @()
foreach ($scene in $scenes) {
    $fileName = "$($scene.id).png"
    $filePath = Join-Path $OUTPUT_DIR $fileName
    if (Test-Path $filePath) {
        Write-Output "[$($scene.id)] Skipped (already exists): $($scene.name)"
        $jobs += @{
            id = $scene.id
            name = $scene.name
            job_id = "skipped"
            status = "completed"
            url = "skipped"
            file = $fileName
        }
        continue
    }

    $body = @{
        prompt = $scene.prompt
        width = 1024
        height = 768
        steps = 28
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/generate/image/bfl/flux-1-dev" `
            -Method Post `
            -Headers @{Authorization="Bearer $API_TOKEN"; "Content-Type"="application/json"} `
            -Body $body `
            -TimeoutSec 30

        $jobs += @{
            id = $scene.id
            name = $scene.name
            job_id = $response.job_id
            status = $response.status
            url = $null
            file = $null
        }
        Write-Output "[$($scene.id)] Submitted: $($scene.name) -> $($response.job_id)"
    } catch {
        Write-Output "[$($scene.id)] FAILED: $($scene.name) -> $_"
    }
}

Write-Output ""
Write-Output "All jobs submitted. Waiting for completion..."

# Poll all jobs until complete
$completed = 0
$maxAttempts = 60

for ($attempt = 0; $attempt -lt $maxAttempts; $attempt++) {
    $allDone = $true
    foreach ($job in $jobs) {
        if ($job.url) { continue }

        try {
            $result = Invoke-RestMethod -Uri "$API_BASE/jobs/$($job.job_id)" `
                -Headers @{Authorization="Bearer $API_TOKEN"} `
                -TimeoutSec 10

            if ($result.status -eq "completed") {
                $job.url = $result.result.urls[0]
                $job.status = "completed"
                $completed++
                Write-Output "[$($job.id)] DONE: $($job.name) -> $($job.url)"
            } elseif ($result.status -eq "failed") {
                $job.status = "failed"
                $completed++
                Write-Output "[$($job.id)] FAILED: $($job.name)"
            } else {
                $allDone = $false
            }
        } catch {
            $allDone = $false
        }
    }

    if ($allDone -and $completed -ge $jobs.Count) { break }
    if ($attempt -lt $maxAttempts - 1) {
        Write-Output "Polling... ($completed/$($jobs.Count) done)"
        Start-Sleep -Seconds 3
    }
}

Write-Output ""
Write-Output "=== Downloading Images ==="

# Download all images
$successCount = 0
foreach ($job in $jobs) {
    if ($job.url -and $job.url -ne "skipped") {
        $fileName = "$($job.id).png"
        $filePath = Join-Path $OUTPUT_DIR $fileName
        try {
            Invoke-WebRequest -Uri $job.url -OutFile $filePath -TimeoutSec 60
            $job.file = $fileName
            $successCount++
            Write-Output "[$($job.id)] Downloaded: $fileName"
        } catch {
            Write-Output "[$($job.id)] Download FAILED: $_"
        }
    }
}

# Save results JSON
$results = @{
    generated_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
    total = $scenes.Count
    success = $successCount
    scenes = $jobs
}
$results | ConvertTo-Json -Depth 3 | Set-Content $RESULTS_FILE -Encoding UTF8

Write-Output ""
Write-Output "=== Complete ==="
Write-Output "Generated: $successCount / $($scenes.Count) images"
Write-Output "Results: $RESULTS_FILE"
Write-Output "Images: $OUTPUT_DIR"
