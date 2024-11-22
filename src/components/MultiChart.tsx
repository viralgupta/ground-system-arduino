import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

type props = {
  name: string;
  domainLeft?: any;
  domainRight?: any;
  data: any;
  colors?: string[];
};

const MultiChart = ({ name, data, domainLeft, domainRight, colors = ['#4b9ac4', '#82ca9d', '#ca8882'] }: props) => {
  
  return (
    <div className="w-min outline outline-white p-2 rounded-md h-[300px]">
      <div className="flex justify-between">
        <span className="text-white font-bold font-mono">{name}</span>
      </div>
      <LineChart
        width={460}
        height={window.innerHeight / 3}
        data={data}
        className="mt-2"
      >
        {Object.keys(data[0])[0] && <Line
          type="monotone"
          dataKey={`${Object.keys(data[0])[0]}`}
          stroke={colors[0]}
          isAnimationActive={false}
        />}
        {Object.keys(data[0])[1] && <Line
          type="monotone"
          dataKey={`${Object.keys(data[0])[1]}`}
          stroke={colors[1]}
          isAnimationActive={false}
        />}
        {Object.keys(data[0])[2] && <Line
          type="monotone"
          dataKey={`${Object.keys(data[0])[2]}`}
          stroke={colors[2]}
          isAnimationActive={false}
        />}
        {/* <CartesianGrid /> */}
        <XAxis className="hey"/>
        {!domainRight && <YAxis className="hey" />}
        {domainRight && <YAxis domain={[domainLeft, domainRight]} />}
        <Tooltip contentStyle={{ backgroundColor: "black", color: "white" }} />
      </LineChart>
    </div>
  );
};

export default MultiChart;
