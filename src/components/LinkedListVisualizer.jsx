import React, { useState } from "react";

// Nó da Lista Encadeada
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

// Lista Encadeada com Move-To-Front e Transposição
class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  contains(value) {
    let current = this.head;
    while (current) {
      if (current.value === value) return true;
      current = current.next;
    }
    return false;
  }

  insert(value) {
    if (this.contains(value)) return false; // Impede valores repetidos

    let newNode = new Node(value);
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.size++;
    return true;
  }

  remove(value) {
    if (!this.head) return;
    if (this.head.value === value) {
      this.head = this.head.next;
      this.size--;
      return;
    }
    let current = this.head;
    while (current.next && current.next.value !== value) {
      current = current.next;
    }
    if (current.next) {
      current.next = current.next.next;
      this.size--;
    }
  }

  search(value, moveToFront = false, transpose = false) {
    if (!this.head) return { index: -1, prev: null, current: null, next: null };
    
    let prev = null;
    let current = this.head;
    let index = 0;

    while (current) {
      if (current.value === value) {
        let next = current.next ? current.next.value : null;
        
        if (moveToFront && prev) {
          prev.next = current.next;
          current.next = this.head;
          this.head = current;
        } else if (transpose && prev) {
          prev.value = [current.value, (current.value = prev.value)][0]; // Troca valores
        }

        return { index, prev: prev?.value ?? null, current: current.value, next };
      }
      prev = current;
      current = current.next;
      index++;
    }
    
    return { index: -1, prev: null, current: null, next: null };
  }

  toArray() {
    let result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  clear() {
    this.head = null;
    this.size = 0;
  }

  // Algoritmo KMP (Knuth-Morris-Pratt) para buscar um padrão em uma lista
  kmpSearch(pattern) {
    if (!this.head || pattern.length === 0) return -1;

    const patternArray = pattern.split("").map(Number); // Converte o padrão para array de números
    const prefixTable = this.computePrefixTable(patternArray);
    let i = 0; // Índice para a lista
    let j = 0; // Índice para o padrão
    let current = this.head;

    while (current) {
      if (current.value === patternArray[j]) {
        i++;
        j++;
      }

      if (j === patternArray.length) {
        return i - j; // Padrão encontrado na posição i - j
      } else if (current.value !== patternArray[j]) {
        if (j !== 0) {
          j = prefixTable[j - 1];
        } else {
          i++;
        }
      }
      current = current.next;
    }

    return -1; // Padrão não encontrado
  }

  // Calcula a tabela de prefixos para o algoritmo KMP
  computePrefixTable(pattern) {
    const prefixTable = Array(pattern.length).fill(0);
    let length = 0; // Comprimento do prefixo anterior mais longo
    let i = 1;

    while (i < pattern.length) {
      if (pattern[i] === pattern[length]) {
        length++;
        prefixTable[i] = length;
        i++;
      } else {
        if (length !== 0) {
          length = prefixTable[length - 1];
        } else {
          prefixTable[i] = 0;
          i++;
        }
      }
    }
    return prefixTable;
  }
}

const LinkedListVisualizer = () => {
  const [list, setList] = useState(new LinkedList());
  const [values, setValues] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [headDetails, setHeadDetails] = useState({ head: null, next: null, prev: null });
  const [patternInput, setPatternInput] = useState(""); // Input para o padrão KMP

  const updateList = () => {
    setValues(list.toArray());
    setHeadDetails({
      head: list.head?.value ?? null,
      next: list.head?.next?.value ?? null,
      prev: null
    });
  };

  const addValue = () => {
    if (!inputValue.trim()) return;
    const success = list.insert(parseInt(inputValue));
    if (!success) {
      setErrorMessage("⚠️ Esse valor já existe na lista!");
      return;
    }
    setErrorMessage("");
    updateList();
    setInputValue("");
  };

  const removeValue = () => {
    if (!inputValue.trim()) return;
    list.remove(parseInt(inputValue));
    updateList();
    setInputValue("");
  };

  const searchValue = (moveToFront = false, transpose = false) => {
    if (!inputValue.trim()) return;
    const { index, prev, current, next } = list.search(parseInt(inputValue), moveToFront, transpose);
    setSearchResult(index >= 0 ? `Encontrado na posição: ${index}` : "Não encontrado");
    updateList();
    setHeadDetails({ head: current, next, prev });
  };

  const resetList = () => {
    list.clear();
    updateList();
    setSearchResult(null);
    setErrorMessage("");
  };

  const kmpSearchList = () => {
    if (!patternInput.trim()) return;
    const position = list.kmpSearch(patternInput);
    setSearchResult(position >= 0 ? `Padrão encontrado na posição: ${position}` : "Padrão não encontrado");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Lista Encadeada</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite um número"
        />
        <button onClick={addValue}>Adicionar</button>
        <button onClick={removeValue} style={{ backgroundColor: "red", color: "white" }}>Remover</button>
        <button onClick={() => searchValue(false, false)}>🔍 Buscar</button>
        <button onClick={() => searchValue(true, false)}>📌 MTF</button>
        <button onClick={() => searchValue(false, true)}>🔄 Transposição</button>
        <button onClick={resetList} style={{ backgroundColor: "gray", color: "white" }}>⛔ Resetar</button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={patternInput}
          onChange={(e) => setPatternInput(e.target.value)}
          placeholder="Digite o padrão KMP (números separados por vírgula)"
        />
        <button onClick={kmpSearchList}>KMP Buscar Padrão</button>
      </div>

      {errorMessage && <p style={{ color: "red", fontWeight: "bold" }}>{errorMessage}</p>}
      {searchResult && <p style={{ fontWeight: "bold" }}>{searchResult}</p>}

      <div>
        {values.map((value, index) => (
          <span key={index} style={{ margin: "5px", padding: "10px", border: "2px solid black", borderRadius: "5px" }}>
            {value}
          </span>
        ))}
      </div>

      <div style={{ marginTop: "15px", fontSize: "18px" }}>
        <p><strong>Tamanho:</strong> {list.size}</p>
        <p><strong>🔝 Cabeça:</strong> {headDetails.head !== null ? headDetails.head : "Nenhum"}</p>
        <p><strong>⬅️ Anterior:</strong> {headDetails.prev !== null ? headDetails.prev : "Nenhum"}</p>
        <p><strong>➡️ Próximo:</strong> {headDetails.next !== null ? headDetails.next : "Nenhum"}</p>
      </div>
    </div>
  );
};

export default LinkedListVisualizer;