-- Adjusted coordinates to match the uploaded map image accurately
-- Origin (0,0) is Top-Left
-- x increases to the Right, y increases Downwards

-- 1. A Site (Top Left Pink Box)
SELECT 19 as x, 18 as y, 100 as intensity
UNION ALL SELECT 21, 19, 90
UNION ALL SELECT 17, 20, 85
UNION ALL SELECT 22, 16, 80

-- 2. B Site (Bottom Left Pink Box)
UNION ALL SELECT 18 as x, 82 as y, 100 as intensity
UNION ALL SELECT 16, 84, 90
UNION ALL SELECT 20, 80, 85
UNION ALL SELECT 15, 85, 80

-- 3. Mid Doors (Center)
UNION ALL SELECT 48 as x, 52 as y, 95 as intensity
UNION ALL SELECT 50, 50, 90
UNION ALL SELECT 46, 54, 85

-- 4. Long A / Pit (Top Right Area)
UNION ALL SELECT 82 as x, 22 as y, 80 as intensity
UNION ALL SELECT 85, 20, 75
UNION ALL SELECT 78, 25, 70

-- 5. T Spawn / Upper Tunnels (Left Side)
UNION ALL SELECT 12 as x, 45 as y, 60 as intensity
UNION ALL SELECT 15, 48, 55
