import React from "react";
import * as d3 from "d3";

class ContentDataComponent extends React.Component {

    initialX = 10;
    initialY = 50;

    componentDidMount() {
        this.updateContentData();
    }

    componentDidUpdate() {
        this.updateContentData();
    }

    updateContentData() {
        const data = d3.select(this.viz);

        //clear all data from svg - this is should be done for update svg page in render process
        data.selectAll("*").remove();

        if (this.props.initialY) {
            this.initialY = this.props.initialY;
        }

        //table head
        const comments = [
            { x: this.initialX + 10, y: this.initialY, text: "Пройденные вехи в срок", color: "green" },
            { x: this.initialX + 150, y: this.initialY, text: "Срыв", color: "red" },
            { x: this.initialX + 220, y: this.initialY, text: "Даты согласно контрактного графика", color: "blue" },
            { x: this.initialX + 420, y: this.initialY, text: "Прогноз", color: "gray" },
        ];

        const years = this.props.years;
        const currentMontages = this.props.montages;

        //set a comments line
        comments.forEach(item => {
            this.createRhombus(data, item.x, item.y, item.color, { x: item.x + 10, y: item.y + 2, data: item.text, size: "10px times" })
        });

        this.createTableHead(data, years);

        currentMontages.forEach(item => {
            this.createMontageItem(data, years, item, this.initialY + 34)
        });
    }

    // input data: {screen, x ,y ,color, text: {x,y,data,size}}. Screen - SVG from D3.js (main screen). Text - optional param.
    createRhombus(screen, x, y, color, text) {
        const rhombusCoordinates = [x - 5, y, x, y - 5, x + 5, y, x, y + 5];

        //rhombus
        screen.append("polygon")
            .style("fill", color)
            .style("stroke", "black")
            .style("stroke-width", "1")
            .attr("points", rhombusCoordinates);

        //check mark
        screen.append("line")
            .style("stroke", "black")
            .style("stroke-width", "1")
            .attr("x1", x - 2.5)
            .attr("y1", y)
            .attr("x2", x - 0.5)
            .attr("y2", y + 2);

        screen.append("line")
            .style("stroke", "black")
            .style("stroke-width", "1")
            .attr("x1", x - 0.5)
            .attr("y1", y + 2)
            .attr("x2", x + 2.5)
            .attr("y2", y - 1);

        //text
        if (text) {
            screen.append("text")
                .attr("x", text.x)
                .attr("y", text.y)
                .text(text.data)
                .style("font", text.size);
        }
    }

    // creates a table head from input years array
    createTableHead(data, years) {
        let x = this.initialX;
        let y = this.initialY + 10;

        years.forEach(item => {
            data.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", 120)
                .attr("height", 20)
                .style("stroke", "black")
                .style("stroke-width", "1")
                .style("fill", "none");

            data.append("text")
                .attr("x", x + 48)
                .attr("y", y + 13)
                .text(item)
                .style("font", "10px times");

            x += 120;
        });
    }

    //creates a montage item for table with lines and points
    createMontageItem(data, years, tableItem, initialY) {
        let x = this.initialX;

        years.forEach(() => {
            data.append("rect")
                .attr("x", x)
                .attr("y", initialY)
                .attr("width", 120)
                .attr("height", 80)
                .style("stroke", "gray")
                .style("stroke-width", "1")
                .style("fill", "#cce0f1");

            x += 120;
        });

        data.append("line")
            .style("stroke", "gray")
            .style("stroke-width", "1")
            .attr("x1", this.initialX + 120)
            .attr("y1", initialY + 40)
            .attr("x2", this.initialX + 120 * years.length)
            .attr("y2", initialY + 40);

        data.append("text")
            .attr("x", this.initialX + 30)
            .attr("y", initialY + 40)
            .text(tableItem.name)
            .style("font", "14px times");

        //define an array of x coordinate for calculations of coordinates for rhombs    

        let plannedDatesArray = [];
        let actualDatesArray = [];
        tableItem.groups.forEach(item => {
            plannedDatesArray.push({ date: item.planDate });
            actualDatesArray.push({ date: item.actualDate, status: item.status });
        });

        let plannedCoordinates = setRhombsCoordinates(plannedDatesArray, this.initialX);
        let actualCoordinates = setRhombsCoordinates(actualDatesArray, this.initialX);

        //set Y coordinates and colors, also set a pairs of XY for dashed lines

        let dashedLineCoordinates = [];
        for (let i = 0; i < plannedCoordinates.length; i++) {
            plannedCoordinates[i].color = "blue";
            plannedCoordinates[i].y = initialY + 20;
            actualCoordinates[i].y = initialY + 60;
            if (plannedCoordinates[i].x >= actualCoordinates[i].x) {
                actualCoordinates[i].color = "green"
            }
            if (plannedCoordinates[i].x < actualCoordinates[i].x) {
                actualCoordinates[i].color = "red";
            }
            if (actualCoordinates[i].status == "not_started") {
                actualCoordinates[i].color = "gray";
            }

            dashedLineCoordinates.push({
                x1: +plannedCoordinates[i].x,
                y1: +plannedCoordinates[i].y + 5,
                x2: +actualCoordinates[i].x,
                y2: +actualCoordinates[i].y - 5
            });
        }

        function setRhombsCoordinates(datesArray, initialX) {
            let startXarray = [];

            datesArray.forEach(item => {
                const startMontageDataArray = item.date.split('.');
                const startPlannedMontageYear = startMontageDataArray[2];
                let startX = initialX + 120;
                let counter = 1;
                while (startPlannedMontageYear !== years[counter]) {
                    counter++;
                    startX += 120;
                }
                let actualX;
                let fullMonths = +startMontageDataArray[1];
                let days = +startMontageDataArray[0];
                let daysFromYearStart = (fullMonths - 1) * 30 + days;
                actualX = Math.floor(startX + 120 / 360 * daysFromYearStart);
                const coordinates = {
                    x: actualX,
                    y: null,
                    status: item.status,
                    text: item.date
                }

                startXarray.push(coordinates);
            });

            return startXarray;
        }

        //"render" - append lines etc to the svg element

        //planned line 
        const planLine = {
            x1: +plannedCoordinates[0].x,
            y1: +plannedCoordinates[0].y,
            x2: +plannedCoordinates[plannedCoordinates.length - 1].x,
            y2: +plannedCoordinates[plannedCoordinates.length - 1].y
        }

        data.append("line")
            .style("stroke", "black")
            .style("stroke-width", "1")
            .attr("x1", planLine.x1)
            .attr("y1", planLine.y1)
            .attr("x2", planLine.x2)
            .attr("y2", planLine.y2);

        //actual Line

        const actualLine = {
            x1: +actualCoordinates[0].x,
            y1: +actualCoordinates[0].y,
            x2: +actualCoordinates[actualCoordinates.length - 1].x,
            y2: +actualCoordinates[actualCoordinates.length - 1].y
        };

        data.append("line")
            .style("stroke", "black")
            .style("stroke-width", "1")
            .attr("x1", actualLine.x1)
            .attr("y1", actualLine.y1)
            .attr("x2", actualLine.x2)
            .attr("y2", actualLine.y2);

        //rhombes render

        // input data: {screen, x ,y ,color, text: {x,y,data,size}}. Screen - SVG from D3.js (main screen)

        plannedCoordinates.forEach(item => {
            this.createRhombus(data, item.x, item.y, item.color, { x: item.x - 12, y: item.y - 10, data: item.text, size: "6px times" })
        });

        actualCoordinates.forEach(item => {
            this.createRhombus(data, item.x, item.y, item.color, { x: item.x - 12, y: item.y + 13, data: item.text, size: "6px times" })
        });

        //dashed lines
        dashedLineCoordinates.forEach(item => {
            data.append("line")
                .style("stroke", "black")
                .style("stroke-dasharray", ("2, 3"))
                .style("stroke-width", "1")
                .attr("x1", item.x1)
                .attr("y1", item.y1)
                .attr("x2", item.x2)
                .attr("y2", item.y2);
        });

        //set a new initialY for the nex item

        this.initialY += 90;
    }

    render() {
        const width = 1200;
        const height = this.props.montages.length * 90 + 100;
        let contentReady = true;
        if (!this.props.years.length || !this.props.montages.length) {
            contentReady = false;
        }

        return (
            <>
                {
                    contentReady ?
                        <div>
                            <svg ref={viz => (this.viz = viz)}
                                width={width} height={height} >
                            </svg>
                        </div>
                        :
                        <></>
                }
            </>
        );
    }
}

export default ContentDataComponent;