// export default function HomePage({ handlePageChange }) {
//     return (
//         <main>
//             Home Page
//             <form action={handlePageChange}>
//                 <label htmlFor="Text">
//                     <input type="text"
//                         name="userInitialText"
//                     />
//                     <button>changePage</button>
//                 </label>
//             </form>
//         </main>
//     )
// }


import MessageInput from "./MessgeInput";
function HomePage(props) {

    return (
        <>
            <main className="mt-16 max-w-3xl mx-auto text-center">
                <h1
                    className="text-6xl font-bold mb-6 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight font-raisin"
                // style={{
                //   fontFamily: "'Caveat Brush', serif",
                //   color: "black",
                //   // letterSpacing: "0.3rem",
                //   // fontSize: "5rem"
                // }}
                >
                    limmaGenie
                </h1>

                <p className="text-xl font-normal text-gray-700 font-times mt-6">
                    Ask me anything about{" "}
                    <a
                        href="https://doi.org/10.1093/nar/gkv007"
                        className="text-blue-400 hover:text-blue-700 font-medium"
                    >
                        limma
                    </a>{" "}
                    analysis!
                </p>

            </main>
            <div className="container mx-auto max-w-4xl pt-10">
                <MessageInput handleMesages={props.handleMesages} />
            </div>
        </>
    );
};

export default HomePage;
