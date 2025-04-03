import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import Papa from "papaparse";
import { generateTreeData, generateRandomValues, benchmarkStructures } from "./LogicTree";
import HashingVisualizer from "./HashingVisualizer";
import LinkedVisualizer from "./LinkedListVisualizer";
import SkipListVisualizer from "./SkipListVisualizer";

const KnuthVisualizer = () => {
  const [randomValues, setRandomValues] = useState(generateRandomValues(7));
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("bst");
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();
  const svgRef = useRef();
  const numVerticesRef = useRef();
  const [numVertices, setNumVertices] = useState(7);
  const [feedback, setFeedback] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const treeData = useMemo(() => generateTreeData(selectedAlgorithm, randomValues), [selectedAlgorithm, randomValues]);

  useEffect(() => {
    if (!treeData.tree) return;

    const width = 800, height = 600, marginTop = 100;
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${marginTop})`);

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    const cleanTree = (node) => {
      if (!node) return null;
      return {
        value: Array.isArray(node.values) ? node.values.join(", ") : node.value,
        children: (node.children || []).map(cleanTree).filter(Boolean),
      };
    };

    const root = d3.hierarchy(cleanTree(treeData.tree));
    const treeLayout = d3.tree().size([width - 200, height - 250]);
    treeLayout(root);

    const linkGenerator = d3.linkVertical().x((d) => d.x - width / 2).y((d) => d.y);

    g.selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#888")
      .attr("stroke-width", (d) => Math.max(2, 6 - d.source.depth))
      .attr("d", linkGenerator)
      .style("opacity", 0)
      .transition()
      .duration(800 * animationSpeed)
      .ease(d3.easeCubicInOut)
      .style("opacity", 1);

    g.selectAll(".node")
      .data(root.descendants())
      .join("circle")
      .attr("class", "node")
      .attr("r", 20)
      .attr("cx", (d) => d.x - width / 2)
      .attr("cy", (d) => d.y)
      .attr("fill", "#1E90FF")
      .style("cursor", "pointer")
      .transition()
      .duration(800 * animationSpeed)
      .attr("r", 20);

    g.selectAll(".label")
      .data(root.descendants())
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => d.x - width / 2)
      .attr("y", (d) => d.y - 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#fff")
      .text((d) => d.data.value);
  }, [treeData, animationSpeed]);

  const runBenchmark = () => {
    setIsBenchmarking(true);
    try {
      const results = benchmarkStructures(randomValues)();
      setBenchmarkResults(results);
    } catch (err) {
      setError("Erro ao executar o benchmark.");
      console.error(err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const resetAndGenerateRandom = () => {
    setRandomValues(generateRandomValues(numVertices));
    setFeedback("Valores aleatórios gerados.");
    setTimeout(() => setFeedback(null), 3000);
    runBenchmark();
  };

  const addValue = () => {
    const value = parseInt(inputRef.current.value);
    if (isNaN(value)) {
      setError("Por favor, insira um número válido.");
      return;
    }
    if (randomValues.includes(value)) {
      setError(`O valor ${value} já existe na árvore.`);
      return;
    }
    setError(null);
    setRandomValues((prev) => [...prev, value]);
    setFeedback(`Valor ${value} adicionado.`);
    setTimeout(() => setFeedback(null), 3000);
    runBenchmark();
  };

  const removeValue = () => {
    const value = parseInt(inputRef.current.value);
    if (isNaN(value)) {
      setError("Por favor, insira um número válido.");
      return;
    }
    setError(null);
    setRandomValues((prev) => prev.filter((num) => num !== value));
    setFeedback(`Valor ${value} removido.`);
    setTimeout(() => setFeedback(null), 3000);
    runBenchmark();
  };

  const handleNumVerticesChange = (e) => {
    const parsedValue = parseInt(e.target.value);
    if (!isNaN(parsedValue) && parsedValue <= 100) {
      setNumVertices(parsedValue);
    } else {
      setError("O número de vértices deve ser um número válido e menor ou igual a 100.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const algorithmDescriptions = {
    bst: { description: "Árvore de Busca Binária (BST): ...", complexity: "O(log n) médio, O(n) pior caso" },
    avl: { description: "Árvore AVL: ...", complexity: "O(log n)" },
    "b-tree": { description: "Árvore B: ...", complexity: "O(log n)" },
    "fib-tree": { description: "Árvore Fibonacci: ...", complexity: "O(n)" },
  };

  const selectedDescription = algorithmDescriptions[selectedAlgorithm];

  const treeToTableData = (root, algorithmType, values) => {
    const tableData = [{ type: algorithmType, values: values.join(', ') }];
    const traverse = (node, parentValue = null) => {
      if (!node) return;
      tableData.push({
        value: node.value,
        parent: parentValue,
        children: node.children ? node.children.map((child) => child.value).join(", ") : "",
      });
      if (node.children) {
        node.children.forEach((child) => traverse(child, node.value));
      }
    };
    traverse(root);
    return tableData;
  };

  const exportTreeToCSV = () => {
    if (treeData && treeData.tree) {
      const tableData = treeToTableData(treeData.tree, selectedAlgorithm.toUpperCase(), randomValues);
      exportToCSV(tableData, `${selectedAlgorithm}_tree.csv`);
    } else {
      setError("Não há dados de árvore para exportar.");
    }
  };

  const exportToCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
  };

  const shareSimulation = () => {
    const serializedData = btoa(JSON.stringify({ randomValues, selectedAlgorithm, numVertices }));
    const url = `${window.location.origin}?data=${serializedData}`;
    navigator.clipboard.writeText(url);
    setFeedback("Link copiado para a área de transferência!");
    setTimeout(() => setFeedback(null), 3000);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serializedData = urlParams.get("data");
    if (serializedData) {
      try {
        const data = JSON.parse(atob(serializedData));
        setRandomValues(data.randomValues);
        setSelectedAlgorithm(data.selectedAlgorithm);
        setNumVertices(data.numVertices);
      } catch (e) {
        setError("Link inválido.");
      }
    }
  }, []);

  return (
    <div style={{ textAlign: "center", height: "100vh", padding: "20px" }}>
      <h1>Visualizador de Estruturas de Dados</h1>

      <div className="visualizer-container">
        {["bst", "avl", "b-tree", "fib-tree"].map((algo) => (
          <button key={algo} onClick={() => setSelectedAlgorithm(algo)} style={{ margin: "5px" }}>
            {algo.toUpperCase()}
          </button>
        ))}
        <div>
          <input ref={inputRef} type="number" placeholder="Número" />
          <button onClick={addValue}>➕ Adicionar</button>
          <button onClick={removeValue} style={{ backgroundColor: "red", color: "white" }}>➖ Remover</button>
          <button onClick={resetAndGenerateRandom} style={{ backgroundColor: "green", color: "white" }}>Resetar e Aleatório</button>
          <p>Total de vértices a ser gerado</p>
          <input ref={numVerticesRef} type="number" placeholder="Vértices" defaultValue={numVertices} onChange={handleNumVerticesChange} style={{ marginLeft: "10px" }} />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {feedback && <p style={{ color: "green" }}>{feedback}</p>}

        <h2>Árvore {selectedAlgorithm.toUpperCase()}</h2>
        <svg ref={svgRef} style={{ display: "block", margin: "20px auto", border: "1px solid white" }}></svg>
        <button onClick={exportTreeToCSV}>Exportar Árvore CSV</button>

        {selectedDescription && (
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            <h3>Descrição:</h3>
            <p>{selectedDescription.description}</p>
            <h3>Complexidade:</h3>
            <p>{selectedDescription.complexity}</p>
          </div>
        )}

        <div>
          <label>Velocidade da Animação:</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div>
        <h2>Análise Estatística e Benchmarking</h2>
        {benchmarkResults && (
          <div style={{ marginTop: "10px", padding: "10px", border: "1px solid #ddd", textAlign: "left", display: "inline-block" }}>
            <h3>Resultados:</h3>
            {Object.entries(benchmarkResults).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {value}ms
              </p>
            ))}
            <button onClick={() => exportToCSV(Object.entries(benchmarkResults).map(([key, value]) => ({ key, value })), "benchmark_results.csv")}>
              Exportar CSV
            </button>
          </div>
        )}
      </div>

      <div className="visualizer-container">
        <h2>Tabela Hash</h2>
        <HashingVisualizer values={randomValues} />
      </div>

      <div className="visualizer-container">
        <h2>Lista Encadeada</h2>
        <LinkedVisualizer values={randomValues} />
      </div>

      <div className="visualizer-container">
        <h2>Skip List</h2>
        <SkipListVisualizer values={randomValues} />
      </div>

      <button onClick={shareSimulation}>Compartilhar Simulação</button>
    </div>
  );
};

export default KnuthVisualizer;