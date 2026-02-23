import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

const CodeBlock = ({ children, ...props }) => {
    const [copied, setCopied] = useState(false);

    // This is the logic that fixes the [object Object] issue
    const handleCopy = () => {
        const getRawText = (nodes) => {
            return React.Children.toArray(nodes)
                .map((node) => {
                    if (typeof node === "string") return node;
                    if (typeof node === "number") return node.toString();
                    if (node?.props?.children) return getRawText(node.props.children);
                    return "";
                })
                .join("");
        };

        const textToCopy = getRawText(children);

        navigator.clipboard.writeText(textToCopy.replace(/\n$/, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            {/* Copy Button */}
            <button
                type="button"
                onClick={handleCopy}
                className="absolute right-2 top-2 z-30 px-3 py-1 text-xs font-medium text-gray-300 bg-gray-800/90 border border-gray-600 rounded-md hover:bg-gray-700 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                {copied ? " Copied!" : " Copy"}
            </button>

            {/* Code Block Container */}
            <pre {...props} className="mt-0! mb-4! rounded-b-lg overflow-x-auto bg-[#0d1117] p-4">
                {children}
            </pre>
        </div>
    );
};


// A hook that returns the typed string
const useTypewriter = (text, speed = 0.1, active = false, onUpdate) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        // If it's an old message (not active), just show it.
        if (!active) {
            setDisplayedText(text);
            return;
        }

        // If we already have the full text displayed, don't restart
        if (displayedText === text) return;

        // Start typing
        setDisplayedText(""); // Reset text for new active typing
        let index = 0;
        const timer = setInterval(() => {
            if (index < text.length) {
                // Use functional update to ensure we have the right index
                setDisplayedText(text.substring(0, index + 1));
                index++;
                // Trigger the scroll callback if provided
                if (onUpdate) onUpdate();
            } else {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, active]); // Keep these dependencies

    return displayedText;
};

const TypedMarkdown = ({ content, isLast, isLoading, CodeBlockComponent, onType }) => {
    // Pass the onType callback to the hook
    const stringToRender = useTypewriter(content, 0.3, isLast, onType);

    return (
        <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            components={{ pre: CodeBlockComponent }}
        >
            {stringToRender}
        </ReactMarkdown>
    );
};

const Loader = (props) => {
    return (props.isLoading && (
        <div className="flex justify-start">
            <div className="p-4 bg-gray-100 text-gray-500 rounded-2xl rounded-tl-none animate-pulse italic flex items-center gap-2">
                <span>limmaGenie is thinking</span>
                <span className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce [animation-delay:0.2s]">.</span>
                    <span className="animate-bounce [animation-delay:0.4s]">.</span>
                </span>
            </div>
        </div>
    ))
}

export { Loader, TypedMarkdown, CodeBlock };