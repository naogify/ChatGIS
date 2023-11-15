import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import ReactLoading from 'react-loading';
import styles from "./index.module.css";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [mapObject, setMapObject] = useState();
  const [loading, setLoading] = useState(false);
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new window.geolonia.Map({
      container: mapContainer.current,
      zoom: 10,
      center: [134.04654783784918, 34.34283588989655],
      hash: false,
      style: "./style.json",
    })

    map.on("load", () => {
      map.on("click", "takamatsu-shelters", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        let tableHTML = "<table class='popup-table'>";
        tableHTML += "<tr><th>属性</th><th>値</th></tr>"; // ヘッダー行を追加
        for (let key in properties) {
          tableHTML += `<tr><td>${key}</td><td>${properties[key]}</td></tr>`;
        }
        tableHTML += "</table>";

        new geolonia.Popup({
          maxWidth: '300px'
        })
          .setLngLat(coordinates)
          .setHTML(tableHTML)
          .addTo(map);
      });
    });

    setMapObject(map);
  });

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputText }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      console.log(data);

      const { layerId, name, value, filter, functionType } = data;

      if (functionType !== null) {
        const style = mapObject.getStyle();
        const layer = style.layers.find((layer) => layer.id === layerId);
        const paint = layer.paint;

        const filterValue = filter ? filter : null;

        if (functionType === "setPaintProperty") {
          paint[name] = value;
          mapObject.setPaintProperty(layerId, name, value);
        } else if (functionType === "setFilter") {

          mapObject.setFilter(layerId, filterValue);
        }

        mapObject.setLayoutProperty(layerId, "visibility", "visible");
      }

      setInputText("");
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <Head>
        <title>自然言語ジオコーディング by OpenAI API</title>
      </Head>
      {loading &&
        <div className={styles.loading}>
          <ReactLoading type="spin" color="#999999" height={"15%"} width={"15%"} />
        </div>
      }
      <main className={styles.main}>
        <div className={styles.inputSection}>
          <h3>データをアップロードし、<br/>知りたい事を入力して下さい</h3>
          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="animal"
              placeholder="高松市の避難所を青く塗って下さい"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <input type="submit" value="質問する" />
          </form>
          <div className={styles.subTitle}>
            <div>※ 結果の生成までに10秒程度かかる場合があります。</div>
          </div>
        </div>
        <div className={styles.map} ref={mapContainer} />
      </main>
      <script type="text/javascript" src="https://cdn.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </div>
  );
}
