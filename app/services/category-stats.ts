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
        return categories.map(cat => {

            
            const categoryItems = items.filter(item => {
                const label = cat.label.toLowerCase().replace(/s$/, ''); 
                const itemDesc = item.desc?.toLowerCase() || '';
                const itemName = item.name?.toLowerCase() || '';
                
                return itemDesc.includes(label) || itemName.includes(label);
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

            const distDisplay = closestDist === Infinity ? 'None' : `${closestDist.toFixed(1)} km`;

            return {
                ...cat,
                count: count,
                dist: distDisplay
            };
        });
    }
};
