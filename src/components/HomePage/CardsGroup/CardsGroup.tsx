import Link from "@docusaurus/Link";
import Arrow from "../../IconComponents/Arrow";
import { CardGroupType } from "../../constants/types";
import Card from "./Card/Card";
import style from "./CardsGroup.module.css";

interface CardsGroupProps {
  title: string;
  mainColor: string;
  content: CardGroupType[];
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
      <ul>
        {content.map((cardsGroup, index: number) => {
          return (
            <li className={style.cardsGroup} key={index}>
              {cardsGroup.cards.length !== 0 && (
                <>
                    {cardsGroup?.groupName &&   
                    <h4 className={style.cardsGroupSubTitle}>
                        {cardsGroup.groupName}
                    </h4>
                    }
                </>
              )}

              <ul className={style.cardsList}>
                {cardsGroup.cards.map((card, index) => {
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
