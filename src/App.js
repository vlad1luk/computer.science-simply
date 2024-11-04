/* eslint-disable no-unused-vars */
import "./App.css";
import { useState, Fragment, useEffect } from "react";
import networksAnimation from "../src/assets/networksAnim.mp4";
import privateNetwork from "../src/assets/private.mp4";
import chatGpt from "../src/assets/chat-gpt.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";


const serverUrl = "http://localhost:3033/";
const titre = "Computer Science Simply";

async function fetchData(question) {
  const response = await fetch(`${serverUrl}question?question=${question}`, {
    method: "GET",
  });

  const data = await response.text();

  return data;
}

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        Powered by <span className="footer__highlight">OpenAI</span>
      </p>
    </footer>
  );
};

const Message = ({ msg, idx }) => {
  return (
    <div
      id={idx}
      className={msg.user ? "message user-message " : "message ai-message"}
    >
      {msg.content}
    </div>
  );
};

const ChatHeader = ({ setOpt }) => {
  return (
    <div className="chat-header">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <img src={chatGpt} height={50} alt="openai-logo"/>
        <FontAwesomeIcon
          onClick={() => setOpt(0)}
          className="close-window"
          icon={faTimes}
        />
      </div>
    </div>
  );
};


const Header = () => {
  return (
    <header className="header">
      <div className="header__logo">
        <h1>{titre}</h1>
      </div>
      <div className="header__nav">
        <button className="header__button">Se connecter</button>
      </div>
    </header>
  );
};

const Animation = ({ uri, w, h }) => {
  return (
    <div className="video-container">
      <video autoPlay loop muted width={w} height={h}>
        <source src={uri} type="video/mp4" />
      </video>
    </div>
  );
};

const ComprendreNat = () => {
  console.log("hey");
};

function App() {
  const [opt, setOpt] = useState(0);

  const ChatWindow = () => {
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");

    return (
      <div className="chat-container">
        <ChatHeader setOpt={setOpt} />
        <div className="chat-body">
          {messages.map((msg, idx) => (
            <Message msg={msg} idx={idx} />
          ))}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            placeholder="Comment fonctionne ARP ?"
            className="chat-input"
            onChange={(e) => setQuestion(e.target.value)}
            value={question}
          />

          <button
            onClick={async () => {
              setMessages((prevResponses) => [
                ...prevResponses,
                { user: true, content: question },
              ]);
              setQuestion("");
              let aiResponse = await fetchData(question);
              if (aiResponse) {
                setMessages((prevResponses) => [
                  ...prevResponses,
                  { user: false, content: aiResponse },
                ]);
              }
            }}
            className="send-button"
          >
            Envoyer
          </button>
        </div>
      </div>
    );
  };

  const Console = ({output}) => {
    return (
      <div className="console">
        <pre className="output">{output}</pre>
      </div>
    );
  };  

  const JavaScriptCompiler = () => {
    const [code, setCode] = useState("console.log('Hello, world!');");
    const [output, setOutput] = useState("");

    const serverUrl = "http://localhost:3033/"; 

    const runCode = async () => {
      try {
        const response = await fetch(`${serverUrl}run`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        // setSaved(false);
        setOutput(data.output || data.error || "Unknown error");
      } catch (error) {
        setOutput("Error: " + error.message);
      }
    };

    const quitIDE = () => setOpt(0);
    
    return (
      <div className="container">
        <div className="buttonContainer">
          <button className="button quit" onClick={quitIDE}>
            Quit IDE
          </button>
        </div>
        <div className="editor-console-container">
          <textarea
            rows="10"
            cols="50"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              runCode();
            }}
            className="codeIDE"
          />
          <Console output={output} />
        </div>
        
       
      </div>
    );
  };


  const opts = {
    1: <ChatWindow />,
    2: <ComprendreNat />,
    3: <JavaScriptCompiler />,
  };

  const Menu = () => {
    return (
      <nav className="menu">
        <ul className="menu__list">
          {/* ouvrir la fenetre conversationnelle */}
          <li key={1} className="menu__item" onClick={() => setOpt(1)}>
            Poser une question
          </li>
          <li key={2} className="menu__item">
            Comprendre le fonctionnement NAT
          </li>
          <li key={3} onClick={() => setOpt(3)} className="menu__item">
            JavaScript Compilateur
          </li>
          <li className="menu__item">Calculatrice réseaux</li>
          <li className="menu__item">Tester mes connaissances</li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="App">
      <Header />
      {opt === 0 ? (
        <>
          <main className="main-content">
            <Menu />
            <section className="content">
              <h2>
                Bienvenue sur <i>{titre}</i>
              </h2>
            </section>
          </main>
          <div className="container-animations">
            <Animation uri={networksAnimation} w={285} h={300} />
            <Animation uri={privateNetwork} w={285} h={300} />
          </div>
        </>
      ) : (
        <>
          {opts[opt]}
          <Footer />
        </>
      )}
    </div>
  );
}
export default App;
