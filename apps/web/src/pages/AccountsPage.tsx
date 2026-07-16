import OpenFinanceHub from "../modules/open-finance/components/OpenFinanceHub";
import "./AccountsPage.css";

/** Hub financeiro — aba Contas (Open Finance Foundation). */
function AccountsPage() {
  return (
    <div className="atlas-page-shell atlas-page">
      <OpenFinanceHub />
    </div>
  );
}

export default AccountsPage;
