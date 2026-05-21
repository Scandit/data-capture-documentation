import Link from "@docusaurus/Link";
import Arrow from "../../../IconComponents/Arrow";
import style from "./Card.module.css";
import { CardType } from "../../../constants/types";

interface CardProps {
  card: CardType;
  cardColor: string;
  mainColor: string;
}

export default function Card({ card, cardColor, mainColor }: CardProps) {
  return (
    <li
      className={`${style.card} ${!card.isActive ? style.cardNotActive : ""}`}
      style={{
        background: card.isActive ? `${cardColor}` : "transparent",
      }}
    >
      <Link
        className={`${style.cardLink} ${
          !card.isActive ? style.cardNotActiveLink : ""
        }`}
        to={card.isActive ? card.link : ""}
      >
        <div className={style.cardIcon} style={{ color: mainColor }}>
          {card.icon}
        </div>
        <p className={style.cardTitle}>
          {card.name} <Arrow iconClass={style.cardsGroupIcon} />
        </p>
        <p
          className={style.cardApi}
          style={{
            color: mainColor === "var(--IDScanningColor)" ? "#91BFC3" : "",
          }}
        >
          {card.text}
        </p>
        {card.apis && (
          <p
            className={style.cardApiList}
            style={{
              color: mainColor === "var(--IDScanningColor)" ? "#91BFC3" : "",
            }}
          >
            <span className={style.cardApiLabel}>APIs:</span> {card.apis}
          </p>
        )}
      </Link>
    </li>
  );
}
