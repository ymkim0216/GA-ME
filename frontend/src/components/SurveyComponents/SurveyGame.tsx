import { useEffect, useState } from "react";
import { surveyStore } from "../../stores/surveyStore";
import styles from "./SurveyGame.module.css";
import { motion } from "framer-motion";
import SimpleGameCard from "../commonUseComponents/SimpleGameCard";
import { AxiosError } from "axios";
import { ConfigProvider, Steps } from 'antd'
import { addLikeWeight } from '../../url/api';

export interface ChoiceGame {
  gameId: number;
  gameChoiceName: string;
  gameHeaderImg: string;
}

const SurveyGame = () => {
  // checkGameList 내부에 survey 페이지에서 선택한 게임 정보가 들어있다.
  const { data, loading, error, checkGameList, fetchData, addCheckChoiceGame, removeCheckChoiceGame } = surveyStore();
  
  useEffect(() => {
    fetchData(); // 마운트시 데이터 가져오기
  }, [fetchData]); // 데이터 변경시 재랜더링
  // 이 시점에 data에 정보가 들어와있음
  
  const [current, setCurrent] = useState(0);
  const makeBackGroundImg = {
    backgroundImage: `url(${data?.result[current * 12].gameHeaderImg})`,
    backgroundSize: 'cover', // 배경 이미지를 화면에 맞게 확대합니다.
    backgroundPosition: 'center', // 배경 이미지를 가운데 정렬합니다.
    width: '100%',
    height: '100vh', // 화면 전체 높이를 차지하도록 설정합니다.
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
  console.log(makeBackGroundImg);
  const onChange = (value: number) => {
    setCurrent(value);
  };

  const isInGameList = (gameId: number) => {
    if(checkGameList.includes(gameId)) return true;
    return false;
  }

  const changeGameList = (gameId: number) => {
    // 존재한다면 배열에서 게임을 없앤다.
    if(isInGameList(gameId)) removeCheckChoiceGame(gameId);

    // 존재하지 않는다면 배열에 추가한다.
    else addCheckChoiceGame(gameId);
  }
  // 마지막 페이지라면 Submit 버튼 활성화
  const isEndLine = (currentPage: number) => {
    return (currentPage === 2 ? 
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" 
      onClick={() => addLikeWeight(checkGameList)}> Submit </button> 
    : null);
  }

  const getClassForGame = (gameId: number) => {
    if(checkGameList.includes(gameId)) return 'border-2';
    return '';
  }

  if (loading) {
    return (
      <button type="button" className="bg-indigo-500 ..." disabled>
        <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
          Processing...
        </svg>
      </button>
    );
  }

  if (error) {
    const axiosError = error as AxiosError;
    return <div>Error: {axiosError.message}</div>;
  }

  if (!data || !data.result.length) {
    return <div>No data available</div>;
  }

  return (
    <>
    <ConfigProvider
        theme={{
          components: {
            Steps: {
              colorPrimary: "#1FDA11",
              colorBorderBg: "#1FDA11",
              navArrowColor: "#FFFFFF"
            }
          }
        }}
      >
      <div className={styles.container} style={makeBackGroundImg}>        
        <div className={styles.contentWrapper}>        
          <div className="flex justify-center items-center h-full">
            <div className="w-900px h-500px bg-stone-500 rounded-lg p-8">
              {/* 내용 */}
              <div className="bg-white-500">
                <Steps type="navigation" onChange={onChange}
                  current={current}
                  items={[{},{},{},]}
                />
              </div>
              <p className="text-white">
                맞춤 추천을 위해 당신의 게임 취향을 알려주세요!
              </p>
              <div className="bg-stone-900 ">
                <div className="grid grid-cols-4 gap-4 ">
                  {data.result.map((choiceGame: ChoiceGame, index: number) => (
                    <motion.li
                      key={index}
                      className=  { 'list-none' + getClassForGame(choiceGame.gameId)}
                      variants={{
                        hidden: { x: -60, opacity: 0 },
                        visible: {
                          x: 0,
                          opacity: 1,
                          transition: { duration: 0.3 },
                        },
                      }}
                      onClick={() => changeGameList(choiceGame.gameId)}
                    >
                      <SimpleGameCard
                        key={index}
                        gameId={choiceGame.gameId}
                        imageUrl={choiceGame.gameHeaderImg}
                        title={choiceGame.gameChoiceName}
                      />
                    </motion.li>
                  ))}
                </div>
              </div>
                {isEndLine(current)}             
            </div>
            
          </div>          
        </div>
      </div>
      </ConfigProvider>
    </>
  );
};

export default SurveyGame;
