import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrashAlt,
    faInfoCircle,
    //   faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { AboutCard } from "./utils.jsx"
import { useState } from "react";

function Header({ clearChat }) {
    const [showAbout, setShowAbout] = useState(false);
    return (
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-6">
                {/* Notice we use both btn-tactile AND btn-ghost */}
                <button onClick={clearChat} className="btn-tactile btn-ghost text-sm sm:text-base">
                    <FontAwesomeIcon icon={faTrashAlt} />
                    <span className="hidden sm:inline ml-2">Clear chat</span>
                </button>
                {/* Wrapper div for relative positioning */}
                <div className="relative">
                    <button 
                        onClick={() => setShowAbout(!showAbout)} 
                        className="btn-tactile btn-ghost text-sm sm:text-base"
                    >
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span className="hidden sm:inline ml-2">About us</span>
                    </button>

                    {/* The Card Component */}
                    <AboutCard 
                        isOpen={showAbout} 
                        onClose={() => setShowAbout(false)} 
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button className="btn-tactile btn-ghost px-2 sm:px-4 text-sm sm:text-base">
                    Login
                </button>
                <button className="btn-tactile btn-primary text-sm sm:text-base">
                    Sign up
                </button>
            </div>
        </header>
    );
}

export default Header;
