import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import FinancialAnalysis from './pages/FinancialAnalysis';
import CRM from './pages/CRM';
import ClientPortal from './pages/ClientPortal';
import ConsultantPortal from './pages/ConsultantPortal';
import Calculators from './pages/Calculators';
import FinancialPlanner from './pages/FinancialPlanner';
import AuxiliaryTools from './pages/AuxiliaryTools';
import FinancialPlanCreate from './pages/FinancialPlanCreate';
import ProductCatalogAdmin from './pages/ProductCatalogAdmin';
import CascoOfferDemo from './pages/CascoOfferDemo';
import ProductConfigDemo from './pages/ProductConfigDemo';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "About": About,
    "Services": Services,
    "Contact": Contact,
    "FinancialAnalysis": FinancialAnalysis,
    "CRM": CRM,
    "ClientPortal": ClientPortal,
    "ConsultantPortal": ConsultantPortal,
    "Calculators": Calculators,
    "FinancialPlanner": FinancialPlanner,
    "AuxiliaryTools": AuxiliaryTools,
    "FinancialPlanCreate": FinancialPlanCreate,
    "ProductCatalogAdmin": ProductCatalogAdmin,
    "CascoOfferDemo": CascoOfferDemo,
    "ProductConfigDemo": ProductConfigDemo,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};