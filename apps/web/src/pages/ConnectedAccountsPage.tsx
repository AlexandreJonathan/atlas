import ConnectedAccountsScreen from "../modules/open-finance/components/ConnectedAccountsScreen";
import "./AccountsPage.css";

function ConnectedAccountsPage() {
  return (
    <div className="atlas-page-shell atlas-page">
      <ConnectedAccountsScreen />
    </div>
  );
}

export default ConnectedAccountsPage;
