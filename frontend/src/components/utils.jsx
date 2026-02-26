import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

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

    navigator.clipboard.writeText(textToCopy.replace(/\n$/, ""));
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
    <ReactMarkdown rehypePlugins={[rehypeHighlight]} components={{ pre: CodeBlockComponent }}>
      {stringToRender}
    </ReactMarkdown>
  );
};

const Loader = (props) => {
  return (
    props.isLoading && (
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
    )
  );
};

const AboutCard = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-x-4 top-3 z-100 bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 sm:p-8 overflow-y-auto max-h-[85vh] animate-in fade-in slide-in-from-top-4 duration-300
                        md:absolute md:top-14 md:left-0 md:right-auto md:w-150 lg:w-175"
    >
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-4 mb-1">
          Welcome to limmaGenie!
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-500 transition-all duration-200 text-xl p-2 cursor-pointer hover:scale-110 active:scale-95"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Content Body */}
      <div className="prose prose-slate max-w-none prose-sm sm:prose-base">
        <p>
          <em>limmaGenie</em> is your friendly, web-based assistant designed to help you perform
          differential expression analysis with the powerful{" "}
          <a href="https://doi.org/10.1093/nar/gkv007">
            <em>limma</em>
          </a>{" "}
          package. Whether you're just getting started or already an experienced researcher,{" "}
          <em>limmaGenie</em> is here to guide you.
        </p>

        <p className="mt-1">
          From RNA-seq and microarrays to proteomics, we walk you through every step: designing
          experiments, generating R code, and interpreting results.
        </p>

        {/* Secondary Heading - Unified Style
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-8 mb-4">📘 Learn More About limma</h2>
                <ul className="space-y-1">
                    <li><a href="https://bioconductor.org/packages/release/bioc/vignettes/limma/inst/doc/usersguide.pdf" target="_blank" rel="noreferrer">limma User's Guide (Bioconductor)</a></li>
                    <li><a href="https://f1000research.com/articles/9-1444/v1" target="_blank" rel="noreferrer">Guide to creating design matrices</a></li>
                    <li><a href="https://f1000research.com/articles/5-1408/v2" target="_blank" rel="noreferrer">RNA-seq analysis easy as 1-2-3</a></li>
                </ul> */}

        {/* Tertiary Heading - Unified Style */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-2 mb-1">
          Built & maintained by
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          {/* Creator 1: Sudipta */}
          <NameCard
            name="Sudipta Kumar Hazra"
            img="https://media.licdn.com/dms/image/v2/D5603AQEeOoBcSsoZIw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1708100906917?e=1773878400&v=beta&t=Y2t1rGFP4s6ZtSpkBxcGk8ypDfKHpNhEGBVDno_gcX0"
            role="AI Data Scientist | Statistics, NLP & Full-stack"
            linkedin="https://www.linkedin.com/in/sudipta-kumar-hazra/"
          />
          <NameCard
            name="Kushagra Bhatnagar"
            img="https://media.licdn.com/dms/image/v2/D5603AQHfzwz1TDXqwA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1694746049826?e=1773878400&v=beta&t=9Kh30UG2D_FmjLm0lJf31KY_cdVCNepYo3DcNNFR52c"
            role="ML Developer | LLMs & NLP"
            linkedin="https://www.linkedin.com/in/kushagra-bhatnagar-aa8120219/"
          />
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-center not-prose">
          <h4 className="font-bold text-blue-900 mb-1">💬 Got Suggestions?</h4>
          <p className="text-sm text-blue-700 mb-3">
            Help us refine limmaGenie to better serve the research community.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdfkM5M5M9NwqMNBUT0_Z41gS6zlSDYpXvFb02gWi9GoplFbg/viewform"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Submit feedback here
          </a>
        </div>
      </div>
    </div>
  );
};

function NameCard({ name, role, img, linkedin }) {
  return (
    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <img
        src={img}
        alt={name}
        className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
      />
      <div>
        <h4 className="font-bold text-gray-900 leading-tight">{name}</h4>
        <p className="text-xs text-gray-500">{role}</p>
        <a href={linkedin} className="text-blue-500 text-xs hover:underline">
          LinkedIn
        </a>
      </div>
    </div>
  );
}

export { Loader, TypedMarkdown, CodeBlock, AboutCard };
