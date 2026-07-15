import { useEffect } from "react";
import { QuestionModel } from "../../oseg/engine/models/QuestionModel";
import { ScenarioModel } from "../../oseg/engine/models/ScenarioModel";
import QuestionEditor from "./QuestionEditor";

interface QuestionsEditorProps {
  data: ScenarioModel;
  setData: (data: ScenarioModel) => void;
  sideIndex: number;
  setSideIndex: (sideIndex: number) => void;
  questionIndex: number;
  setQuestionIndex: (questionIndex: number) => void;
}

function QuestionsEditor(props: QuestionsEditorProps) {
  function getNameForCandidate(id: number) {
    const can = data.candidates.filter((x) => x.id == id)[0];
    return can.firstName + " " + can.lastName;
  }

  const {
    data,
    setData,
    sideIndex,
    setSideIndex,
    questionIndex,
    setQuestionIndex,
  } = props;

  const side = data.scenarioSides[sideIndex];

  useEffect(() => {
    if (side != undefined) {
      setQuestionIndex(0);
    }
  }, [sideIndex]);

  if (data.scenarioSides.length == 0 || side == undefined) {
    return (
      <p>
        There are no scenario sides defined. Go to Candidates and create a new
        ScenarioSide from there for the candidate you want to make questions for.
      </p>
    );
  }

  const questions = side.questions;

  const addQuestion = () => {
    const newQuestion: QuestionModel = {
      id: Math.round(Math.random() * 10000000),
      description: "New question description here",
      answers: [],
      keepInPlaceIfQuestionsShuffled: false,
      enabled: true,
    };
    const newQuestions = [...questions, newQuestion];
    const newSides = [...data.scenarioSides];
    newSides[sideIndex] = {
      ...newSides[sideIndex],
      questions: newQuestions,
    };
    setData({ ...data, scenarioSides: newSides });
    setQuestionIndex(newQuestions.length - 1);
  };

  const deleteQuestion = (e: React.MouseEvent) => {
  // Prevent event bubbling
  e.stopPropagation();
  
  // Add confirmation dialog
  if (!window.confirm("⚠️ Are you sure you want to delete this question? This cannot be undone.")) {
    return; // Exit early if user cancels
  }
  
  // Proceed with deletion
  const newQuestions = side.questions.filter((_, idx) => idx !== questionIndex);
  
  const newSides = [...data.scenarioSides];
  newSides[sideIndex] = {
    ...newSides[sideIndex],
    questions: newQuestions
  };
  
  // Force a deep copy to ensure React detects the change
  setData(JSON.parse(JSON.stringify({ ...data, scenarioSides: newSides })));
  
  // Update question index if needed
  if (questionIndex >= newQuestions.length) {
    setQuestionIndex(Math.max(0, newQuestions.length - 1));
  }
};

  const cloneQuestion = () => {
    const currentQuestion = questions[questionIndex];
    const newQuestion = JSON.parse(JSON.stringify(currentQuestion));
    newQuestion.id = Math.round(Math.random() * 10000000);
    const newQuestions = [...questions];
    newQuestions.splice(questionIndex + 1, 0, newQuestion);
    const newSides = [...data.scenarioSides];
    newSides[sideIndex] = {
      ...newSides[sideIndex],
      questions: newQuestions,
    };
    setData({ ...data, scenarioSides: newSides });
    setQuestionIndex(questionIndex + 1);
  };

  const moveQuestionUp = () => {
    if (questionIndex <= 0) return;
    const newQuestions = [...questions];
    const temp = newQuestions[questionIndex];
    newQuestions[questionIndex] = newQuestions[questionIndex - 1];
    newQuestions[questionIndex - 1] = temp;
    const newSides = [...data.scenarioSides];
    newSides[sideIndex] = {
      ...newSides[sideIndex],
      questions: newQuestions,
    };
    setData({ ...data, scenarioSides: newSides });
    setQuestionIndex(questionIndex - 1);
  };

  const moveQuestionDown = () => {
    if (questionIndex >= questions.length - 1) return;
    const newQuestions = [...questions];
    const temp = newQuestions[questionIndex];
    newQuestions[questionIndex] = newQuestions[questionIndex + 1];
    newQuestions[questionIndex + 1] = temp;
    const newSides = [...data.scenarioSides];
    newSides[sideIndex] = {
      ...newSides[sideIndex],
      questions: newQuestions,
    };
    setData({ ...data, scenarioSides: newSides });
    setQuestionIndex(questionIndex + 1);
  };

  return (
    <div>
      <h2>Questions for {getNameForCandidate(side.playerId)}</h2>
      <div className="QuestionSelector">
        <select
          value={questionIndex}
          onChange={(e) => setQuestionIndex(Number(e.target.value))}
        >
          {questions.map((question, index) => (
            <option key={question.id} value={index}>
              {index + 1} - {question.description.slice(0, 30)}...
            </option>
          ))}
        </select>

        <button className="GreenButton" onClick={addQuestion}>
          +
        </button>
        <button className="RedButton" onClick={deleteQuestion}>
          -
        </button>
        <button className="BlueButton" onClick={cloneQuestion}>
          Clone
        </button>

        <button disabled={questionIndex <= 0} onClick={moveQuestionUp}>
          ⬆️
        </button>
        <button
          disabled={questionIndex >= side.questions.length - 1}
          onClick={moveQuestionDown}
        >
          ⬇️
        </button>

        <QuestionEditor
          sideIndex={sideIndex}
          questionIndex={questionIndex}
          question={side.questions[questionIndex]}
          data={data}
          setData={setData}
        ></QuestionEditor>
      </div>
    </div>
  );
}

export default QuestionsEditor;