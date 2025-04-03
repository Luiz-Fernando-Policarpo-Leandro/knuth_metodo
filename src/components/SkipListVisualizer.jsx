import React, { useState } from "react";

class SkipListNode {
  constructor(value, level) {
    this.value = value;
    this.next = new Array(level).fill(null);
  }
}

class SkipList {
  constructor(maxLevel = 4) {
    this.maxLevel = maxLevel;
    this.head = new SkipListNode(null, maxLevel);
    this.level = 0;
  }

  randomLevel() {
    let lvl = 1;
    while (Math.random() < 0.33 && lvl < this.maxLevel) {
      lvl++;
    }
    return lvl;
  }

  insert(value) {
    let update = new Array(this.maxLevel).fill(this.head);
    let current = this.head;

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] && current.next[i].value < value) {
        current = current.next[i];
      }
      update[i] = current;
    }

    let newLevel = this.randomLevel();
    if (newLevel > this.level) {
      for (let i = this.level; i < newLevel; i++) {
        update[i] = this.head;
      }
      this.level = newLevel;
    }

    let newNode = new SkipListNode(value, newLevel);
    for (let i = 0; i < newLevel; i++) {
      newNode.next[i] = update[i].next[i];
      update[i].next[i] = newNode;
    }
  }

  remove(value) {
    let update = new Array(this.maxLevel).fill(null);
    let current = this.head;

    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] && current.next[i].value < value) {
        current = current.next[i];
      }
      update[i] = current;
    }

    if (current.next[0] && current.next[0].value === value) {
      for (let i = 0; i < this.maxLevel; i++) {
        if (update[i].next[i] !== current.next[0]) break;
        update[i].next[i] = current.next[0].next[i];
      }
    }
  }

  search(value) {
    let current = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (current.next[i] && current.next[i].value < value) {
        current = current.next[i];
      }
    }
    return current.next[0] && current.next[0].value === value;
  }

  toArray() {
    let result = [];
    let current = this.head.next[0];
    while (current) {
      result.push({ value: current.value, level: current.next.length });
      current = current.next[0];
    }
    return result;
  }

  clear() {
    this.head = new SkipListNode(null, this.maxLevel);
    this.level = 0;
  }
}

const SkipListVisualizer = () => {
  const [skipList, setSkipList] = useState(new SkipList());
  const [inputValue, setInputValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const updateList = (operation) => {
    if (!inputValue.trim()) return;

    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setErrorMessage("Por favor, digite um número válido.");
      return;
    }

    setErrorMessage(null);
    const newList = new SkipList();
    newList.head = skipList.head;
    newList.level = skipList.level;

    if (operation === "insert") newList.insert(value);
    if (operation === "remove") newList.remove(value);
    if (operation === "search") {
      setSearchResult(newList.search(value) ? "Elemento encontrado ✅" : "Elemento não encontrado ❌");
      return;
    }

    setSkipList(newList);
    setInputValue("");
  };

  const resetList = () => {
    skipList.clear();
    setSkipList(new SkipList());
    setSearchResult(null);
    setErrorMessage(null);
  };

  return (
    <div>
      <h2>Skip List</h2>
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Digite um número"
      />
      <button onClick={() => updateList("insert")}>Adicionar</button>
      <button onClick={() => updateList("remove")} style={{ backgroundColor: "red", color: "white" }}>Remover</button>
      <button onClick={() => updateList("search")}> Buscar</button>
      <button onClick={resetList} style={{ backgroundColor: "gray", color: "white" }}>⛔ Resetar</button>

      {searchResult && <p style={{ fontWeight: "bold" }}>{searchResult}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <div>
        {skipList.toArray().map((node, index) => (
          <span key={index} style={{ margin: "5px", padding: "10px", border: "2px solid black", borderRadius: "5px" }}>
            {node.value} (Lv {node.level})
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkipListVisualizer;