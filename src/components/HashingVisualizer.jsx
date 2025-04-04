import React, { useState, useRef } from "react";

// Componente principal para visualização de hashing
const HashingVisualizer = () => {
  // Estado para armazenar o tamanho da tabela hash
  const [tableSize, setTableSize] = useState(10);
  // Estado para armazenar a tabela hash, inicializada com null em todas as posições
  const [hashTable, setHashTable] = useState(Array(10).fill(null));
  // Estado para armazenar a estratégia de hashing selecionada
  const [selectedStrategy, setSelectedStrategy] = useState("knuth");
  // Referência para o campo de entrada de texto
  const inputRef = useRef();

  // Função de hashing de Knuth
  const knuthHash = (key) => (key * 2654435761 % 2 ** 32) % tableSize;
  // Função de hashing universal
  const universalHash = (key, a = 31, b = 17) => ((a * key + b) % 101) % tableSize;

  // Estratégia de resolução de colisão: sondagem linear
  const linearProbing = (table, key) => {
    let index = knuthHash(key);
    // Procura por uma posição livre na tabela
    while (table[index] !== null) index = (index + 1) % tableSize;
    return index;
  };

  // Estratégia de resolução de colisão: hashing duplo
  const doubleHashing = (key) => {
    let h1 = knuthHash(key); // Primeiro hash
    let h2 = 1 + (key % (tableSize - 1)); // Segundo hash
    // Procura por uma posição livre na tabela usando o segundo hash
    for (let i = 0; i < tableSize; i++) {
      let index = (h1 + i * h2) % tableSize;
      if (hashTable[index] === null) return index;
    }
    return -1; // Retorna -1 se a tabela estiver cheia
  };

  // Processa a entrada de texto e insere os valores na tabela hash
  const processInput = () => {
    const inputText = inputRef.current.value;
    // Se não houver entrada, sai da função
    if (!inputText) return;

    // Converte a entrada de texto em um array de números
    const values = inputText.split(",").map((num) => parseInt(num.trim())).filter((num) => !isNaN(num));

    // Cria uma cópia da tabela hash atual
    let newTable = [...hashTable];

    // Insere cada valor na tabela hash usando a estratégia selecionada
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
          // Se a tabela estiver cheia, exibe um alerta e sai da função
          if (index === -1) return alert("Tabela cheia!");
          break;
        default:
          return;
      }
      // Insere o valor na posição calculada
      newTable[index] = value;
    });

    // Atualiza a tabela hash com os novos valores
    setHashTable(newTable);
    // Limpa o campo de entrada
    inputRef.current.value = "";
  };

  // Remove um valor específico da tabela hash
  const removeValue = () => {
    const value = parseInt(inputRef.current.value);
    // Se o valor não for um número válido, sai da função
    if (isNaN(value)) return;

    // Cria uma cópia da tabela hash atual
    let newTable = [...hashTable];
    // Encontra o índice do valor na tabela
    const index = newTable.indexOf(value);
    // Se o valor for encontrado, remove-o da tabela
    if (index !== -1) newTable[index] = null;

    // Atualiza a tabela hash com os novos valores
    setHashTable(newTable);
    // Limpa o campo de entrada
    inputRef.current.value = "";
  };

  // Reseta a tabela hash, preenchendo todas as posições com null
  const clearTable = () => setHashTable(Array(tableSize).fill(null));

  // Atualiza o tamanho da tabela hash e reseta os dados
  const handleTableSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    // Se o novo tamanho não for um número válido ou for menor que 1, sai da função
    if (!isNaN(newSize) && newSize > 0) {
      // Atualiza o tamanho da tabela
      setTableSize(newSize);
      // Reseta a tabela hash
      setHashTable(Array(newSize).fill(null));
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Visualizador de Hashing</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Tamanho da Tabela: </label>
        <input type="number" min="1" value={tableSize} onChange={handleTableSizeChange} />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Escolha o método de hashing: </label>
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
        <button onClick={clearTable} style={{ backgroundColor: "gray", color: "white" }}>Resetar</button>
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