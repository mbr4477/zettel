import * as d3force from "https://cdn.skypack.dev/d3-force@3";
import * as d3 from "https://cdn.skypack.dev/d3";

const width = window.innerWidth
const height = window.innerHeight

window.fetch("/api/graph/" + dir)
    .then(res => res.json())
    .then(({ nodes, links }) => {
        console.log(nodes)
        nodes.forEach((v, i) => {
            v.radius = Math.max(2, Math.sqrt(links.filter(l => l.source === i || l.target === i).length) * 5)
        })
        const force = d3force.forceSimulation(nodes)
            .force('charge', d3force.forceManyBody().strength(-300))
            .force('center', d3force.forceCenter(width / 2, height / 2))
            .force('link', d3force.forceLink().links(links).distance(75))
            .on('tick', ticked)

        d3.select("svg")
            .call(d3.zoom().on('zoom', zoomed))



        let transform = { k: 1, x: 0, y: 0 }

        function zoomed(event) {
            transform = event.transform
            console.log(transform)
            ticked()
        }

        function ticked() {
            const minX = d3.min(nodes.map(d => d.x))
            const maxX = d3.max(nodes.map(d => d.x))
            const minY = d3.min(nodes.map(d => d.y))
            const maxY = d3.max(nodes.map(d => d.y))

            console.log(minX, maxX, minY, maxY)
            d3.select("svg")
                .select("g")
                .attr("transform", `translate(${transform.x} ${transform.y}) scale(${transform.k})`)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y)
                .style("stroke", "rgba(50, 50, 50)")
                .style("stroke-width", 2)

            const a = d3.select("svg")
                .attr("width", width)
                .attr("height", height)
                .select("g")
                .selectAll("a")
                .data(nodes)
                .join("a")
                .attr("href", d => "file:///" + d.path)

            a.selectAll("circle")
                .data(d => [d])
                .join("circle")
                .attr("r", d => d.radius)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .style("fill", "#3eb489")
                .style("stroke-width", 0)


            a
                .selectAll("text")
                .data(d => [d])
                .join("text")
                .text(d => d.name)
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .attr("dx", d => d.radius + 5)
                .attr("dy", "0.4em")
                .style("font-size", "0.8em")
                .style("fill", "white")
        }
    })