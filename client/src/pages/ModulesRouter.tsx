import { useRoute } from "wouter";
import SpeedToLead from "./modules/SpeedToLead";
import DatabaseReactivation from "./modules/DatabaseReactivation";
import Appointments from "./modules/Appointments";
import VoiceAssistant from "./modules/VoiceAssistant";
import FollowUpSequences from "./modules/FollowUpSequences";
import SEOAudit from "./modules/SEOAudit";
import Reputation from "./modules/Reputation";
import Content from "./modules/Content";
import Reporting from "./modules/Reporting";
import Campaigns from "./modules/Campaigns";
import LeadGenAgent from "./modules/LeadGenAgent";
import MissedCallTextBack from "./modules/MissedCallTextBack";
import ProposalBuilder from "./modules/ProposalBuilder";
import PreQualFunnel from "./modules/PreQualFunnel";
import ChatAgentBuilder from "./modules/ChatAgentBuilder";
import NotFound from "./NotFound";

export default function ModulesRouter() {
  const [match, params] = useRoute("/modules/:moduleId");

  if (!match) {
    return <NotFound />;
  }

  const moduleId = (params as any)?.moduleId;

  const modules: Record<string, React.ComponentType> = {
    "speed-to-lead": SpeedToLead,
    "reactivation": DatabaseReactivation,
    "appointments": Appointments,
    "voice": VoiceAssistant,
    "sequences": FollowUpSequences,
    "seo-audit": SEOAudit,
    "reputation": Reputation,
    "content": Content,
    "reporting": Reporting,
    "campaigns": Campaigns,
    "lead-gen-agent": LeadGenAgent,
    "missed-call": MissedCallTextBack,
    "proposals": ProposalBuilder,
    "pre-qual": PreQualFunnel,
    "chat-agent": ChatAgentBuilder,
  };

  const Component = modules[moduleId];

  if (!Component) {
    return <NotFound />;
  }

  return <Component />;
}
