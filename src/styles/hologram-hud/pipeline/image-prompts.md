# Hologram HUD · پرامپت عکس‌ها (نمونه‌ی واقعی فیلم مرجع، با GPT Image)

**قالب هر عکس این سبک:**
- پس‌زمینه‌ی **کاملاً مشکیِ خالص**، چون مشکی در کد شفاف می‌شود (ترکیب `screen`) و هولوگرام روی صحنه می‌نشیند.
- بدون هیچ متن، عدد یا لوگو. متن و عدد را کد می‌نویسد.
- مربع (۱:۱)، مگر جایی که گفته شده.
- برای موضوع خودت فقط بخش «شیء» هر پرامپت را عوض کن؛ «پایه‌ی مشترک» را دست نزن تا همه‌ی عکس‌ها هم‌سبک بمانند.

**ذخیره:** در پوشه‌ی ویدیوی خودت (مثلاً `public/v01/img/`) و همان اسم‌ها را در `IMAGES` فایل `Video.tsx` بگذار. عکس‌های فیلم مرجع در `public/styles/hologram-hud/img/` هستند (`satellite`، `earth`، `control`، `testsat`، `phone`، `einstein`).
**بعد از ساختن:** با یک شبکه‌ی ۱۰×۱۰ روی عکس، جای قطعه‌ها (پنل، بدنه، سر، مانیتور) را اندازه بگیر تا برچسب‌ها دقیق روی همان قطعه بنشینند (`satPt`، `crPt` در `demo/scenes.ts`):
`ffmpeg -i img/satellite.png -vf "scale=600:-1,drawgrid=w=60:h=60:t=1:c=white@0.25" grid.jpg`

**پایه‌ی مشترک:** این را اول هر پرامپت بگذار.

```
Amber-orange holographic 3D render, glowing emissive orange edges (#ff9a3c) with translucent amber surfaces, fine wireframe detail and panel lines, faint horizontal scanlines, soft bloom, subtle chromatic glitch, sci-fi HUD hologram look, isolated object on a pure black background (#000000), no floor, no text, no numbers, no logos.
```

## 1. satellite.png: ماهواره‌ی GPS
```
A modern GPS navigation satellite in three-quarter view: a boxy main body covered in gold-foil-like panels, two long rectangular solar panel wings extended left and right with a fine grid of cells, a cluster of antenna rods pointing down from the body, small thrusters. Centered, filling about 80% of the width.
```

## 2. earth.png: کره‌ی زمین
```
A holographic Earth globe: latitude and longitude wireframe grid, continents drawn as glowing amber outlines and dotted fills, the Americas facing the viewer, a thin atmosphere glow ring. Perfectly centered, a full sphere.
```

## 3. control.png: اتاق کنترل ۱۹۷۷ (افقی ۳:۲)
```
An isometric hologram of a 1970s satellite control room on a round glowing platform: three engineers in short-sleeve shirts seen from behind, sitting on office chairs at a long console with CRT monitors, switches and dials, one engineer pointing at a screen. Centered, the whole round platform visible.
```

## 4. testsat.png: ماهواره‌ی آزمایشی ۱۹۷۷ (NTS-2)
```
A 1970s experimental navigation satellite seen from the side: a short cylindrical octagonal body, two small rectangular solar panel wings on booms, spherical and rod antennas, a few helical antennas hanging below. Centered, filling about 70% of the width.
```

## 5. phone.png: گوشی
```
A modern smartphone standing upright, front view, slightly turned: glowing amber outline, a map grid on its screen with a small location marker in the center, thin edge highlights. Centered, about 60% of the height.
```

## (اختیاری) einstein.png: اینشتین
```
A holographic bust portrait of Albert Einstein in three-quarter view, made of glowing amber lines and translucent planes, wild hair, mustache, gentle expression. Centered, head and shoulders.
```
