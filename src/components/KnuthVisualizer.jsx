import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import Papa from "papaparse";
import { generateTreeData, generateRandomValues, benchmarkStructures } from "./LogicTree";
import HashingVisualizer from "./HashingVisualizer";
import LinkedVisualizer from "./LinkedListVisualizer";
import SkipListVisualizer from "./SkipListVisualizer";

const KnuthVisualizer = () => {
  // Estado para armazenar os valores aleatórios usados na visualização
  const [randomValues, setRandomValues] = useState(generateRandomValues(7));
  // Estado para armazenar o algoritmo de árvore selecionado (bst, avl, b-tree, fib-tree)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("bst");
  // Estado para armazenar os resultados do benchmark
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  // Estado para indicar se o benchmark está em execução
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  // Estado para armazenar mensagens de erro
  const [error, setError] = useState(null);
  // Referência para o campo de entrada de valores
  const inputRef = useRef();
  // Referência para o elemento SVG onde a árvore será desenhada
  const svgRef = useRef();
  // Referência para o campo de entrada do número de vértices
  const numVerticesRef = useRef();
  // Estado para armazenar o número de vértices a serem gerados
  const [numVertices, setNumVertices] = useState(7);
  // Estado para armazenar mensagens de feedback ao usuário
  const [feedback, setFeedback] = useState(null);
  // Estado para controlar a velocidade da animação
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Gera os dados da árvore com base no algoritmo selecionado e nos valores aleatórios
  const treeData = useMemo(() => generateTreeData(selectedAlgorithm, randomValues), [selectedAlgorithm, randomValues]);

  // Efeito para desenhar a árvore no SVG sempre que os dados da árvore ou a velocidade da animação mudam
  useEffect(() => {
    if (!treeData.tree) return;

    const width = 800, height = 600, marginTop = 100;
    d3.select(svgRef.current).selectAll("*").remove(); // Limpa o SVG

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${marginTop})`); // Cria um grupo para a árvore

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", (event) => g.attr("transform", event.transform)); // Configura o zoom
    svg.call(zoom);

    // Função para limpar os dados da árvore para visualização
    const cleanTree = (node) => {
      if (!node) return null;
      return {
        value: Array.isArray(node.values) ? node.values.join(", ") : node.value,
        children: (node.children || []).map(cleanTree).filter(Boolean),
      };
    };

    const root = d3.hierarchy(cleanTree(treeData.tree)); // Cria a hierarquia de dados para o D3
    const treeLayout = d3.tree().size([width - 200, height - 250]); // Configura o layout da árvore
    treeLayout(root); // Aplica o layout aos dados

    const linkGenerator = d3.linkVertical().x((d) => d.x - width / 2).y((d) => d.y); // Configura o gerador de links

    // Desenha os links entre os nós
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

    // Desenha os nós da árvore
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

    // Adiciona rótulos aos nós
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

  // Executa o benchmark das estruturas de dados
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

  // Reseta os valores aleatórios e gera novos valores
  const resetAndGenerateRandom = () => {
    setRandomValues(generateRandomValues(numVertices));
    setFeedback("Valores aleatórios gerados.");
    setTimeout(() => setFeedback(null), 3000);
    runBenchmark();
  };

  // Adiciona um valor à lista de valores aleatórios
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

  // Remove um valor da lista de valores aleatórios
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

  // Manipula a mudança no número de vértices
  const handleNumVerticesChange = (e) => {
    const parsedValue = parseInt(e.target.value);
    if (!isNaN(parsedValue) && parsedValue <= 100) {
      setNumVertices(parsedValue);
    } else {
      setError("O número de vértices deve ser um número válido e menor ou igual a 100.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Descrições e complexidades dos algoritmos de árvore
  const algorithmDescriptions = {
    bst: {
      description: "Árvore de Busca Binária (BST): Uma árvore binária onde para cada nó, todos os nós na subárvore esquerda são menores e todos os nós na subárvore direita são maiores. Eficiente para busca, inserção e remoção em média.",
      complexity: "O(log n) médio, O(n) pior caso. O pior caso ocorre quando a árvore se degenera em uma lista ligada.",
    },
    avl: {
      description: "Árvore AVL: Uma árvore de busca binária auto-balanceada que mantém a altura das subárvores esquerda e direita de cada nó dentro de um fator de 1. Isso garante que a altura da árvore seja sempre logarítmica.",
      complexity: "O(log n). Devido ao balanceamento, as operações de busca, inserção e remoção sempre têm complexidade logarítmica.",
    },
    "b-tree": {
      description: "Árvore B: Uma árvore auto-balanceada que permite múltiplos filhos por nó. É otimizada para sistemas que leem e escrevem grandes blocos de dados. Comumente usada em bancos de dados e sistemas de arquivos.",
      complexity: "O(log n). As operações de busca, inserção e remoção são logarítmicas, pois a árvore mantém um balanceamento eficiente.",
    },
    "fib-tree": {
      description: "Árvore Fibonacci: Uma árvore binária onde a altura de cada nó é determinada pela sequência de Fibonacci. Usada em algumas estruturas de dados avançadas e algoritmos de prioridade.",
      complexity: "O(n). A altura da árvore pode crescer linearmente com o número de nós, resultando em complexidade linear para operações.",
    },
  };

  const selectedDescription = algorithmDescriptions[selectedAlgorithm];

  // Converte os dados da árvore para um formato de tabela
  const treeToTableData = (root, algorithmType, values) => {
    const tableData = [{ type: algorithmType, values: values.join(", ") }];
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

  // Exporta os dados da árvore para um arquivo CSV
  const exportTreeToCSV = () => {
    if (treeData && treeData.tree) {
      const tableData = treeToTableData(treeData.tree, selectedAlgorithm.toUpperCase(), randomValues);
      exportToCSV(tableData, `${selectedAlgorithm}_tree.csv`);
    } else {
      setError("Não há dados de árvore para exportar.");
    }
  };

  // Função auxiliar para exportar dados para CSV
  const exportToCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
  };

  // Compartilha a simulação através de um link
  const shareSimulation = () => {
    const serializedData = btoa(JSON.stringify({ randomValues, selectedAlgorithm, numVertices }));
    const url = `${window.location.origin}?data=${serializedData}`;
    navigator.clipboard.writeText(url);
    setFeedback("Link copiado para a área de transferência!");
    setTimeout(() => setFeedback(null), 3000);
  };

  // Efeito para lidar com parâmetros de URL ao carregar a página
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
        <button onClick={shareSimulation}>Compartilhar Simulação</button>

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
          </div>
        )}
      </div>

      <div className="visualizer-container">
        <HashingVisualizer values={randomValues} />
      </div>

      <div className="visualizer-container">
        <LinkedVisualizer values={randomValues} />
      </div>

      <div className="visualizer-container">
        <SkipListVisualizer values={randomValues} />
      </div>

    </div>
  );
};

export default KnuthVisualizer;