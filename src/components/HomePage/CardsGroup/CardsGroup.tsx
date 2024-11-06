import Link from "@docusaurus/Link";
import Arrow from "../../IconComponents/Arrow";
import Card from "./Card/Card";
import style from "./CardsGroup.module.css";
import { CardType } from "../../constants/types";

interface CardsGroupProps {
  title: string;
  mainColor: string;
  content: CardType[];
  cardColor: string;
  linkStarted: string;
}

export default function CardsGroup({
  title,
  mainColor,
  content,
  cardColor,
  linkStarted,
}: CardsGroupProps) {
  return (
    <div className={style.cardsGroupWrapper}>
      <div className={style.cardsGroupHeader}>
        <h2 className={style.cardsGroupTitle}>{title}</h2>
        <Link
          className={style.cardsGroupBtn}
          style={{ color: mainColor }}
          type="button"
          to={linkStarted}
        >
          Get started
          <Arrow iconClass={style.cardsGroupIcon} />
        </Link>
      </div>
      <ul className={style.cardsList}>
        {content.map((card, index: number) => {
          return (
            <Card
              card={card}
              mainColor={mainColor}
              cardColor={cardColor}
              key={index}
            ></Card>
          );
        })}
      </ul>
    </div>
  );
}
