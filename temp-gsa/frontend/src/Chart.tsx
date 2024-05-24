import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

type props = {
    name: string;
    domainLeft?: any;
    domainRight?: any;
    data: { uv: number;}[]
}

const Chart = ({ name, data, domainLeft, domainRight }: props) => {

    return (
        <div className='w-min border p-2 rounded-md'>
            <div className='flex justify-between'>
                <span className='text-white font-bold'>{name}</span>
                {/* <div>
                    <input type="checkbox" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </div> */}
            </div>
            <LineChart width={460} height={window.innerHeight / 3} data={data} className='mt-2'>
                <Line type="monotone" dataKey="uv" stroke="#8884d8" isAnimationActive={false}/>
                {/* <CartesianGrid /> */}
                <XAxis />
                {!domainRight && <YAxis/>}
                {domainRight && <YAxis domain={[domainLeft, domainRight]}/>}
                <Tooltip contentStyle={{ backgroundColor: 'black', color: "white" }} />
            </LineChart>
        </div>
    )
}

export default Chart