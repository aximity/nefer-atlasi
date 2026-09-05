"use client";

import EndgameLab from "./EndgameLab";
import MiningGuide from "./MiningGuide";
import SkillGuides from "./SkillGuides";
import ProjectScorecard from "./ProjectScorecard";
import ContributionCenter from "./ContributionCenter";
import ConnectedAtlas from "./ConnectedAtlas";
import QuestAtlas from "./QuestAtlas";
import IssueDesk from "./IssueDesk";
import EconomyWorkshop from "./EconomyWorkshop";
import SustainabilityHub from "./SustainabilityHub";
import RecipeCatalog from "./RecipeCatalog";
import EquipmentBuilder from "./equipment-builder";
import GroupRegions from "./group-regions";
import ItemExplorer from "./item-explorer";
import { ItemModal } from "./item-explorer-parts";
import TalismanGuide from "./talisman-guide";
import { type AtlasNavigation } from "./use-atlas-navigation";

type AtlasModuleSurfaceProps = {
  navigation: AtlasNavigation;
};

function ActiveModule({ navigation }: AtlasModuleSurfaceProps) {
  switch (navigation.activeModule) {
    case "builder":
      return <EquipmentBuilder key={navigation.builderSeed.revision} initialClass={navigation.klass} initialTalismanId={navigation.talismanId} initialBuildCode={navigation.builderSeed.code} onClassChange={navigation.setClass} onTalismanChange={navigation.setTalismanId} />;
    case "engine":
      return <TalismanGuide />;
    case "recipes":
      return <RecipeCatalog key={navigation.recipeRevision} />;
    case "group-regions": {
      const [regionName, bossName] = navigation.regionSearchSeed.split("|||");
      return <GroupRegions key={navigation.regionSearchSeed} initialRegionName={regionName} initialBossName={bossName} onOpen={navigation.setExternalDetail} />;
    }
    case "quests":
      return <QuestAtlas key={navigation.questSearchSeed} initialQuery={navigation.questSearchSeed} />;
    case "endgame":
      return <EndgameLab />;
    case "mining":
      return <MiningGuide key={navigation.miningRevision} />;
    case "economy":
      return <EconomyWorkshop />;
    case "sustainability":
      return <SustainabilityHub />;
    case "skills":
      return <SkillGuides key={navigation.abilitySearchSeed} klass={navigation.klass} initialAbilityId={navigation.abilitySearchSeed} onClassChange={navigation.setClass} />;
    case "issues":
      return <IssueDesk />;
    case "health":
      return <ProjectScorecard />;
    case "contribute":
      return <ContributionCenter />;
    case "items":
      return <ItemExplorer key={navigation.itemSeed.revision} initialItemId={navigation.itemSeed.id} focusInitialItem={navigation.itemSeed.focus} onCloseItem={navigation.closeItem} />;
    case "atlas":
      return <ConnectedAtlas key={navigation.atlasRevision} />;
    default:
      return null;
  }
}

export default function AtlasModuleSurface({ navigation }: AtlasModuleSurfaceProps) {
  return <>
    <ActiveModule navigation={navigation} />
    {navigation.externalDetail && <ItemModal item={navigation.externalDetail} close={() => navigation.setExternalDetail(null)} />}
  </>;
}
