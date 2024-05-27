import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

type props = {
    name: string;
    domainLeft?: any;
    domainRight?: any;
    data: { uv: number;}[]
}

const Chart = ({ name, data, domainLeft, domainRight }: props) => {

    return (
        <div className='w-min outline outline-white p-2 rounded-md'>
            <div className='flex justify-between'>
                <span className='text-white font-bold font-mono'>{name}</span>
            </div>
            <LineChart width={460} height={window.innerHeight / 3} data={data} className='mt-2'>
                <Line type="monotone" dataKey="uv" stroke="#8884d8" isAnimationActive={false}/>
                {/* <CartesianGrid /> */}
                <XAxis className='hey'/>
                {!domainRight && <YAxis className='hey'/>}
                {domainRight && <YAxis domain={[domainLeft, domainRight]}/>}
                <Tooltip contentStyle={{ backgroundColor: 'black', color: "white" }} />
            </LineChart>
        </div>
    )
}

export default Chart