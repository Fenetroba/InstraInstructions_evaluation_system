import GetEvaluationList from "@/Components/Instractor/GetEvaluationList";
import Header from "@/Components/Instractor/Header";
import Sider from "@/Components/Instractor/Sider";
import React from "react";

const InstractorHome = ({ user }) => {
  return (
    <div className=" h-screen">
      <Header />
      <Sider />
      <div className="flex items-center text-(--one)">
        <div className="m-4 bg-(--six) p-3 rounded-r-lg">
        HELLO 👋👋
          <span className="bg-(--three) p-3 rounded-lg ml-10">{user.fullName}</span>
        </div>
      </div>
      <GetEvaluationList />
    </div>
  );
};

export default InstractorHome;
