const normalize=value=>value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9çğıöşü]+/gi," ").trim();
export function resolveEnchantRows(itemName,rows){const haystack=` ${normalize(itemName)} `;return rows.filter(row=>haystack.includes(` ${normalize(row.name)} `)).toSorted((a,b)=>b.name.length-a.name.length)}
export function sumEnchantRows(rows){return rows.reduce((totals,row)=>{totals[row.attribute]=(totals[row.attribute]??0)+row.value;return totals},{})}
