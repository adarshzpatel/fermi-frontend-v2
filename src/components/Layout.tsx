import Header from "./Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-default-50/50 flex flex-col min-h-screen text-default-700">
      <Header />
      <div className="  flex-1  ">{children}</div>
    </main>
  );
};

export default Layout;
