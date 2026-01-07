import About from './pages/About';
import AuxiliaryTools from './pages/AuxiliaryTools';
import CRM from './pages/CRM';
import Calculators from './pages/Calculators';
import CascoOfferDemo from './pages/CascoOfferDemo';
import ClientPortal from './pages/ClientPortal';
import ConsultantPortal from './pages/ConsultantPortal';
import Contact from './pages/Contact';
import FinancialAnalysis from './pages/FinancialAnalysis';
import FinancialPlanCreate from './pages/FinancialPlanCreate';
import FinancialPlanner from './pages/FinancialPlanner';
import Home from './pages/Home';
import ProductCatalogAdmin from './pages/ProductCatalogAdmin';
import ProductConfigDemo from './pages/ProductConfigDemo';
import Services from './pages/Services';
import app from './pages/_app';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AuxiliaryTools": AuxiliaryTools,
    "CRM": CRM,
    "Calculators": Calculators,
    "CascoOfferDemo": CascoOfferDemo,
    "ClientPortal": ClientPortal,
    "ConsultantPortal": ConsultantPortal,
    "Contact": Contact,
    "FinancialAnalysis": FinancialAnalysis,
    "FinancialPlanCreate": FinancialPlanCreate,
    "FinancialPlanner": FinancialPlanner,
    "Home": Home,
    "ProductCatalogAdmin": ProductCatalogAdmin,
    "ProductConfigDemo": ProductConfigDemo,
    "Services": Services,
    "_app": app,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};