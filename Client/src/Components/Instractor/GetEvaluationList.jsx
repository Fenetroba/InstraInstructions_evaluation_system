import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchEvaluations } from "@/Store/EvaluationSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Users, Award, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GetEvaluationList = () => {
  const { evaluations, status } = useSelector((state) => state.evaluations);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchEvaluations());
  }, [dispatch]);

  const InstructorRoleEvaluation = evaluations.filter(
    (evaluation) => evaluation.category === "Self_Evaluation"
  );
  const FriendRoleEvaluation = evaluations.filter(
    (evaluation) => evaluation.category === "College_Team"
  );
const HandleSelfEvaluating=(EvaluationId,category)=>{
  if(category==="Self_Evaluation"){
    navigate(`/evaluation/${EvaluationId}`)
  }else{
    navigate(`/evaluation/peer-evaluation/${EvaluationId}`)
  }

}
  const renderEvaluationCard = (evaluation, index, type) => {
    if (!evaluation) return null;
    
    const isActive = evaluation.status === 'active';
    const title = type === 'self' ? 'Self Evaluation' : 'Peer Evaluation';
    const icon = type === 'self' ? <User className="h-5 w-5" /> : <Users className="h-5 w-5" />;
    
    return (
      <Card key={index} className="w-full max-w-md mx-4 mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-(--six) p-3 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <Badge 
              variant={isActive ? "default" : "secondary"} 
              className={`${isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'}`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-(--one)">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">{evaluation.title}</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              <span>Academic Year: {evaluation.academicYear || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-amber-500" />
              <span>Semester: {evaluation.semester || 'N/A'}</span>
            </div>
            {evaluation.endDate && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-red-500" />
                <span>Ends: {new Date(evaluation.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
            onClick={()=>HandleSelfEvaluating(evaluation._id, evaluation.category)}
              className={`w-full  py-2 px-4 rounded-md font-medium transition-colors ${
                isActive
                  ? 'bg-(--three) cursor-pointer text-white hover:bg-green-700'
                  : 'bg-yellow-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isActive}
            >
              {isActive ? 'Start Evaluation' : 'Evaluation Not Available'}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Instructor Evaluation Portal
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Evaluate yourself and your peers to help improve teaching quality
          </p>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-start lg:items-stretch gap-8">
          {InstructorRoleEvaluation.length > 0 ? (
            renderEvaluationCard(InstructorRoleEvaluation[0], 0, 'self')
          ) : (
            <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
              <p className="text-gray-500">No self-evaluation available at the moment.</p>
            </div>
          )}

          {FriendRoleEvaluation.length > 0 ? (
            renderEvaluationCard(FriendRoleEvaluation[0], 1, 'peer')
          ) : (
            <div className="w-full max-w-md p-8 text-center bg-(--two) rounded-lg shadow-lg">
              <p className="text-gray-500">No peer evaluation available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetEvaluationList;