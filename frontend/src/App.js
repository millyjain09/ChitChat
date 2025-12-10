import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";

function App() {
  return (
    <div className="App" style={{ 
        minHeight: "100vh",
        backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", // Premium Soft Blue-Grey Gradient
        // Aap chahein to ye darker gradient bhi use kar sakte hain:
        // backgroundImage: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)", 
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed" // Scroll karne par background fix rahega
    }}>
      <Route path="/" component={Homepage} exact />
      <Route path="/chats" component={Chatpage} />
    </div>
  );
}

export default App;