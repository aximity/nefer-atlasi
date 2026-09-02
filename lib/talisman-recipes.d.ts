export interface TalismanRecipeIngredientView {kind:"talisman"|"material";name:string;quantity:number;acquisition:string|null}
export function canonicalMaterialName(name:unknown):string|null;
export function talismanRecipeFor<T extends {talismanId:string}>(talismanId:string, recipes:T[]):T|undefined;
export function talismanRecipeIngredients(recipe:{ingredients:Array<{kind:"talisman"|"material";talismanId?:string;name?:string;quantity:number}>}|undefined, talismans:Array<{id:string;name:string}>, materialAcquisitions:Array<{material:string;acquisitionType:string;region?:string;profession?:string;sourceEntity:string}>):TalismanRecipeIngredientView[];
