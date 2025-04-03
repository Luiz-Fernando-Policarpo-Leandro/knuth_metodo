import React, { useState, useRef } from "react";
import * as d3 from "d3";

// 📌 Componente principal
const HashingVisualizer = () => {
  const [tableSize, setTableSize] = useState(10);
  const [hashTable, setHashTable] = useState(Array(10).fill(null));
  const [selectedStrategy, setSelectedStrategy] = useState("knuth");
  const inputRef = useRef();

  // 📌 Funções de Hashing
  const knuthHash = (key) => (key * 2654435761 % 2 ** 32) % tableSize;
  const universalHash = (key, a = 31, b = 17) => ((a * key + b) % 101) % tableSize;

  // 📌 Estratégias de resolução de colisão
  const linearProbing = (table, key) => {
    let index = knuthHash(key);
    while (table[index] !== null) index = (index + 1) % tableSize;
    return index;
  };

  const doubleHashing = (key) => {
    let h1 = knuthHash(key);
    let h2 = 1 + (key % (tableSize - 1));
    for (let i = 0; i < tableSize; i++) {
      let index = (h1 + i * h2) % tableSize;
      if (hashTable[index] === null) return index;
    }
    return -1; // Tabela cheia
  };

  // 📌 Processa a entrada e insere valores na tabela
  const processInput = () => {
    const inputText = inputRef.current.value;
    if (!inputText) return;

    const values = inputText.split(",").map((num) => parseInt(num.trim())).filter((num) => !isNaN(num));

    let newTable = [...hashTable];

    values.forEach((value) => {
      let index;
      switch (selectedStrategy) {
        case "knuth":
          index = knuthHash(value);
          break;
        case "universal":
          index = universalHash(value);
          break;
        case "linear":
          index = linearProbing(newTable, value);
          break;
        case "double":
          index = doubleHashing(value);
          if (index === -1) return alert("Tabela cheia!"); 
          break;
        default:
          return;
      }
      newTable[index] = value;
    });

    setHashTable(newTable);
    inputRef.current.value = "";
  };

  // 📌 Remove um valor específico da tabela
  const removeValue = () => {
    const value = parseInt(inputRef.current.value);
    if (isNaN(value)) return;

    let newTable = [...hashTable];
    const index = newTable.indexOf(value);
    if (index !== -1) newTable[index] = null;

    setHashTable(newTable);
    inputRef.current.value = "";
  };

  // 📌 Reseta a tabela
  const clearTable = () => setHashTable(Array(tableSize).fill(null));

  // 📌 Atualiza o tamanho da tabela e reseta os dados
  const handleTableSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    if (!isNaN(newSize) && newSize > 0) {
      setTableSize(newSize);
      setHashTable(Array(newSize).fill(null)); // Resetar tabela
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>🔢 Visualizador de Hashing</h2>

      <div style={{ marginBottom: "10px" }}>
        <label><b>Tamanho da Tabela: </b></label>
        <input type="number" min="1" value={tableSize} onChange={handleTableSizeChange} />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label><b>Escolha o método de hashing: </b></label>
        <select onChange={(e) => setSelectedStrategy(e.target.value)}>
          <option value="knuth">Hashing Perfeito (Knuth)</option>
          <option value="universal">Hashing Universal</option>
          <option value="linear">Sondagem Linear</option>
          <option value="double">Dupla Hash</option>
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
        <input ref={inputRef} type="text" placeholder="Digite números separados por vírgula" style={{ width: "300px" }} />
        <button onClick={processInput}>Adicionar</button>
        <button onClick={removeValue} style={{ backgroundColor: "red", color: "white" }}>Remover</button>
        <button onClick={clearTable} style={{ backgroundColor: "gray", color: "white" }}>⛔ Resetar</button>
      </div>

      <div style={{ overflowX: "auto", whiteSpace: "nowrap", marginTop: "20px" }}>
        <svg width={Math.max(tableSize * 50 + 40, 500)} height="200">
          {hashTable.map((value, i) => (
            <g key={i} transform={`translate(${i * 50 + 20}, 50)`}>
              <rect width="40" height="40" fill={value !== null ? "#1E90FF" : "#ddd"} stroke="black" rx="5" />
              <text x="20" y="20" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14px">
                {value !== null ? value : ""}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default HashingVisualizer;
