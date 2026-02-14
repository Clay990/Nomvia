import { BuilderItem } from "./builders";

export interface CategoryStat {
    id: number;
    label: string;
    icon: string;
    count: number;
    dist: string;
}

export const CategoryStatsService = {
    calculateStats(items: BuilderItem[], categories: any[]): CategoryStat[] {
        const KEYWORD_MAP: { [key: string]: string[] } = {
            "Mechanics": ["mechanic", "engine", "repair", "automotive"],
            "Electricians": ["electrician", "electrical", "wiring"],
            "Carpenters": ["carpenter", "wood", "cabinet", "furniture"],
            "Solar Techs": ["solar", "panel", "energy", "inverter"],
            "Towing": ["towing", "tow", "recovery"],
        };

        return categories.map(cat => {
            const keywords = KEYWORD_MAP[cat.label] || [cat.label.toLowerCase().replace(/s$/, '')];
            
            const categoryItems = items.filter(item => {
                const text = `${item.name} ${item.desc} ${item.skills?.join(' ')}`.toLowerCase();
                return keywords.some(k => text.includes(k));
            });

            const count = categoryItems.length;

            let closestDist = Infinity;
            categoryItems.forEach(item => {
                if (item.dist) {
                    const distVal = parseFloat(item.dist.split(' ')[0]);
                    if (!isNaN(distVal) && distVal < closestDist) {
                        closestDist = distVal;
                    }
                }
            });

            const distDisplay = closestDist === Infinity ? '...' : `${closestDist.toFixed(1)} km`;

            return {
                ...cat,
                count: count,
                dist: distDisplay
            };
        });
    }
};
