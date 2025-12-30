import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";

import Screen1 from "./screens/Screen1";
import Screen2 from "./screens/Screen2";
import Screen2Liga from "./screens/Screen2Liga";
import Screen3 from "./screens/Screen3";
import Screen4 from "./screens/Screen4";
import Screen5 from "./screens/Screen5";
import Screen6 from "./screens/Screen6";
import Screen7 from "./screens/Screen7";
import Screen8 from "./screens/Screen8";

const screens = [
  "screen1",
  "screen2",
  "screen2Liga",
  "screen3",
  "screen4",
  "screen5",
  "screen6",
  "screen7",
  "screen8",
];

export default function App() {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentScreenIndex((i) => Math.min(i + 1, screens.length - 1)),
    onSwipedRight: () =>
      setCurrentScreenIndex((i) => Math.max(i - 1, 0)),
    trackMouse: true,
    preventDefaultTouchmoveEvent: false, // dozvoljava pinch/zoom
  });

  const renderScreen = () => {
    switch (screens[currentScreenIndex]) {
      case "screen1":
        return <Screen1 />;
      case "screen2":
        return <Screen2 />;
      case "screen2Liga":
        return <Screen2Liga />;
      case "screen3":
        return <Screen3 />;
      case "screen4":
        return <Screen4 />;
      case "screen5":
        return <Screen5 />;
      case "screen6":
        return <Screen6 />;
      case "screen7":
        return <Screen7 />;
      case "screen8":
        return <Screen8 />;
      default:
        return <Screen1 />;
    }
  };

  return (
    <div {...swipeHandlers} style={{ touchAction: "pan-y pinch-zoom" }}>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", margin: "5px" }}>
        {screens.map((screen, idx) => (
          <button key={screen} onClick={() => setCurrentScreenIndex(idx)}>
            {screen}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "10px" }}>{renderScreen()}</div>
    </div>
  );
}