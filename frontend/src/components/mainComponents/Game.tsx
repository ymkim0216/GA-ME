import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 추가
import GameCard from '../commonUseComponents/GameCard';
import useStoreMain from "../../stores/mainStore";
import { AxiosError } from 'axios';

// 사용 스토어의 구조를 기반으로 하는 구조
interface Game {
  gameId: number;
  gameName: string;
  gameHeaderImg: string;
  gamePriceFinal: number;
  tagList: Array<{ codeId: string; tagId:number; tagName: string }>;
  isPrefer: boolean;
  gameLike: number | null;
}

const GameComponent: React.FC = () => {
  const { data, loading, error, fetchData } = useStoreMain();
  const navigate = useNavigate(); // useNavigate 인스턴스화

  useEffect(() => {
    fetchData(); // 마운트시 데이터 가져오기
  }, [fetchData]); // 데이터 변경시 재랜더링

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    const axiosError = error as AxiosError;
    return <div>Error: {axiosError.message}</div>;
  }

  if (!data || !data.result.length) {
    return <div>No data available</div>;
  }

  const handleClickGame = (gameId:number) => {
    navigate(`/detail/${gameId}`)
    console.log('디테일페이지 이동')
  }

  return (
    <motion.ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      initial="hidden"
      animate="visible"
    >
      {data.result.map((game: Game, index: number) => (
        <motion.li key={index} className="list-none"
          variants={{
            hidden: { x: -60, opacity: 0 },
            visible: { x: 0, opacity: 1, transition: { duration: 0.1 } }
          }}
        >
          <GameCard
            key={game.gameId}
            gameId={game.gameId}
            imageUrl={game.gameHeaderImg}
            title={game.gameName}
            price={`₩ ${game.gamePriceFinal}`}
            tagsAll={game.tagList}
            tags={game.tagList.filter(tag => tag.codeId === "GEN").map(tag => tag.tagName)}
            isPrefer={game.isPrefer}
            likes={game.gameLike}
            // 이거 null또는 int인가?..
            onGameClick={handleClickGame} // 수정된 부분
            />
        </motion.li>
      ))}
    </motion.ul>
  );
};

export default GameComponent;