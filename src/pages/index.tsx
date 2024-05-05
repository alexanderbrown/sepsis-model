import Image from 'next/image'
import { useState } from "react";
import { Tooltip } from 'react-tooltip'


export default function Home() {

  const [data, setData] = useState({
    eosIncidence: 0.8,
    tempimp: 37,
    ruptureOfMembranes: 12,
    gestationalAge: 40,
    broadSpectrumAntibioticsGiven: false,
    broadSpectrum2To4hPrior: false,
    gbsPositive: false,
    gbsUnknown: false
  });

  const intercept = {
    0.1: 38.952265,    
    0.2: 39.646367,    
    0.3: 40.0528,
    0.4: 40.3415,
    0.5: 40.5656,
    0.6: 40.7489,
    0.7: 40.903919, 
    0.8: 41.0384, 
    0.9: 41.1571, 
    1.0: 41.263432  
  }


  function getIntercept(eosIncidence: number): number{
    // Looks up the intercept value for the given eosIncidence, rounding to find the closest value
    const keys = Object.keys(intercept).map(Number);
    const closest = keys.reduce((a, b) => Math.abs(b - eosIncidence) < Math.abs(a - eosIncidence) ? b : a) as keyof typeof intercept;
    return intercept[closest];
  }

  const transformedData = {
    eosIncidence: getIntercept(data.eosIncidence),
    tempimp: data.tempimp * 1.8 + 32,
    ruptureOfMembranes: (data.ruptureOfMembranes + 0.05)**0.2,
    gestationalAge: data.gestationalAge,
    gestationalAgeSquared: data.gestationalAge**2,
    broadSpectrumAntibioticsGiven: data.broadSpectrumAntibioticsGiven ? 1 : 0,
    broadSpectrum2To4hPrior: data.broadSpectrum2To4hPrior ? 1 : 0,
    gbsPositive: data.gbsPositive ? 1 : 0,
    gbsUnknown: data.gbsUnknown ? 1 : 0
  }

  const coefficients = {
    tempimp: 0.868,
    ruptureOfMembranes: 1.2256,
    gestationalAge: 	-6.9325,
    gestationalAgeSquared: 0.0877,
    broadSpectrumAntibioticsGiven: -1.1861,
    broadSpectrum2To4hPrior: -1.0488,
    gbsPositive: 	0.5771,
    gbsUnknown: 0.0427
  }

  const weightedValues = {
    eosIncidence: transformedData.eosIncidence,
    tempimp: transformedData.tempimp * coefficients.tempimp,
    ruptureOfMembranes: transformedData.ruptureOfMembranes * coefficients.ruptureOfMembranes,
    gestationalAge: transformedData.gestationalAge * coefficients.gestationalAge,
    gestationalAgeSquared: transformedData.gestationalAgeSquared * coefficients.gestationalAgeSquared,
    broadSpectrumAntibioticsGiven: transformedData.broadSpectrumAntibioticsGiven * coefficients.broadSpectrumAntibioticsGiven,
    broadSpectrum2To4hPrior: transformedData.broadSpectrum2To4hPrior * coefficients.broadSpectrum2To4hPrior,
    gbsPositive: transformedData.gbsPositive * coefficients.gbsPositive,
    gbsUnknown: transformedData.gbsUnknown * coefficients.gbsUnknown
  }

  const beta = Object.values(weightedValues).reduce((a, b) => a + b, 0);
  const srs = 1/(1 + Math.exp(-beta));

  return (
    <main>
      <h1 className="text-4xl text-center m-6">Interactive Neonatal Sepsis Risk Calculator</h1>
      <div className="flex flex-row m-6 space-x-6 items-center">
      <div className="bg-slate-200 p-4 pt-2 border rounded-sm">
      <table >
        <thead>
          <tr>
            <th className="px-2"></th>
            <th className="px-2">Input</th>
            <th className="px-2">Transformed<br />Value</th>
            <th className="px-2">Weighted<br />Value</th>
          </tr>
          </thead>
        <tbody>
          <tr>
            <td className="px-2">EOS Incidence (per 1000 births)</td>
            <td className="px-2">
              <InputSlider min={0.1} max={1} step={0.1} value={data.eosIncidence} 
                           setValue={(v: number) => setData(prev => {return {...prev, eosIncidence: v}})} />
            </td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="This value comes from a lookup table, <br />it's different for each specific indicence">{transformedData.eosIncidence.toFixed(1)}</td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="Weighting: 1">{weightedValues.eosIncidence.toFixed(1)}</td>
          </tr>
          <tr>
            <td className="px-2">Highest Maternal Temperature (C)</td>
            <td className="px-2"> 
              <InputSlider min={35} max={41} step={0.1} value={data.tempimp} 
                           setValue={(v: number) => setData(prev => {return {...prev, tempimp: v}})} />
            </td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-content="Temperature converted to degrees F">{transformedData.tempimp.toFixed(1)}</td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="Weighting: 0.868">{weightedValues.tempimp.toFixed(1)}</td>
          </tr>
          <tr>
            <td className="px-2">Rupture of Membranes (hours)</td>
            <td className="px-2">
              <InputSlider min={0} max={240} step={1} value={data.ruptureOfMembranes}
                           setValue={(v: number) => setData(prev => {return {...prev, ruptureOfMembranes: v}})} />
            </td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="ROM transformed, using the following equation: <br />(ROM + 0.005)<sup>0.2</sup>">{transformedData.ruptureOfMembranes.toFixed(3)}</td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="Weighting: 1.2256">{weightedValues.ruptureOfMembranes.toFixed(3)}</td>
          </tr>
          <tr>
            <td className="px-2">Gestational Age (weeks)</td>
            <td className="px-2">
              <InputSlider min={34} max={43} step={1/7} value={data.gestationalAge} dayWeek={true}
                           setValue={(v: number) => setData(prev => {return {...prev, gestationalAge: v}})} />
            </td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-content="GA in weeks">{transformedData.gestationalAge.toFixed(1)}</td>
            <td className="px-2"  data-tooltip-id="my-tooltip" data-tooltip-html="Weighting: -6.9325">{weightedValues.gestationalAge.toFixed(1)}</td>
          </tr>
          <tr>
            <td className="px-2 pb-4">Gestational Age (weeks), squared</td>
            <td className="px-2"></td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="(GA in weeks)<sup>2</sup>">{(transformedData.gestationalAge**2).toFixed(0)}</td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="Weighting: 0.0877">{weightedValues.gestationalAgeSquared.toFixed(1)}</td>
          </tr>
          <tr>
            <td className="px-2">Broad Spectrum antibiotics given {'>'}4h </td>
            <td className="px-2">
              <Checkbox value={data.broadSpectrumAntibioticsGiven}
                        setValue={(v: boolean) => setData(prev => {return {...prev, broadSpectrumAntibioticsGiven: v}})} />
            </td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-content="1 if true; 0 if false">{transformedData.broadSpectrumAntibioticsGiven ? 1 : 0}</td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="Weighting: -1.1861">{weightedValues.broadSpectrumAntibioticsGiven}</td>
          </tr>
          <tr>
            <td className="px-2">Broad Spectrum 2-4h / GBS-specific  {'>'}2h</td>
            <td className="px-2">
              <Checkbox value={data.broadSpectrum2To4hPrior}
                        setValue={(v: boolean) => setData(prev => {return {...prev, broadSpectrum2To4hPrior: v}})} />
            </td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-content="1 if true; 0 if false">{transformedData.broadSpectrum2To4hPrior ? 1 : 0}</td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="Weighting: -1.0488">{weightedValues.broadSpectrum2To4hPrior}</td>
          </tr>
          <tr>
            <td className="px-2">GBS Positive</td>
            <td className="px-2">
              <Checkbox value={data.gbsPositive}
                        setValue={(v: boolean) => setData(prev => {return {...prev, gbsPositive: v}})} />
            </td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-content="1 if true; 0 if false">{transformedData.gbsPositive ? 1 : 0}</td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="Weighting: 0.5771">{weightedValues.gbsPositive}</td>
          </tr>
          <tr>
            <td className="px-2">GBS Unknown</td>
            <td className="px-2">
              <Checkbox value={data.gbsUnknown}
                        setValue={(v: boolean) => setData(prev => {return {...prev, gbsUnknown: v}})} />
            </td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-content="1 if true; 0 if false">{transformedData.gbsUnknown ? 1 : 0}</td>
            <td className="px-2" data-tooltip-id="my-tooltip" data-tooltip-html="Weighting: 0.0427">{weightedValues.gbsUnknown}</td>
          </tr>
        </tbody>
      </table>
      </div>
      <p data-tooltip-id="my-tooltip" data-tooltip-content="Sum of all the weighted individual scores">
        Logit: {beta.toFixed(4)}
      </p>
      <p data-tooltip-id="my-tooltip" data-tooltip-html={`
      This is calculated by transforming the summed weighted values <br />
      using the logistic function 1/(1+e<sup>-logit</sup>) <br /><br />
      It is used to convert a risk score (logit) to a probability. </br>
      <Image src='/logit vs risk 100 dpi.png' alt='logit vs risk graph' width={500} height={500}/>
        `}>
          Sepsis Risk: {srs.toFixed(5)}
      </p>
      <p data-tooltip-id="my-tooltip" data-tooltip-content="Risk per birth x1000">
        Risk per 1000 births: {(srs * 1000).toFixed(2)}
      </p>
      </div>

      <Tooltip id="my-tooltip" />
      <footer className="text-center m-6">
        <p>Created by <a href="https://www.linkedin.com/in/alexpybrown/">Alex Brown</a> for the <a href="https://londonpaediatrics.co.uk/">London School of Paediatrics AI Teaching Day</a></p>
        <p>Model derived in: <a className='text-sky-700' href="https://doi.org/10.1542/peds.2010-3464">Puopolo et al. 2011</a></p>
        <p>Complete weights reported in: <a className='text-sky-700' href="https://doi.org/10.1016/S2589-7500(23)00253-4">van der Weijden et al. 2024</a></p>
      </footer>

    </main>
  )
}

function InputSlider({min, max, step, value, setValue, dayWeek=false}: {min: number, max: number, step: number, value: number, setValue: (value: number) => void, dayWeek?: boolean}) {
  
  let displayValue: string = value.toString();
  if (dayWeek) {
    displayValue = Math.floor(value) + ' weeks ' + Math.round((value % 1) * 7) + ' days';
  }
  return (
   <div className="flex flex-row">
    <input type="range" className="bg-slate-700 p-2 w-30"
            min={min} max={max} step={step} value={value}
            onChange={e => setValue(parseFloat(e.target.value))}/>
    <p className="ml-2 min-w-32">{displayValue}</p>
    </div>
  )
}

function Checkbox({value, setValue, className}: {value: boolean, setValue: (value: boolean) => void, className?: string }){
  
  return (
    <input type="checkbox" className={"bg-slate-700 p-2 "+className}
            checked={value}
            onChange={e => setValue(e.target.checked)}/>
  )
}

function Label({title}: {title: string}) {
  return (
    <p className="mr-2 w-3/12 mt-1 mb-1">{title}</p>
  )
}

function Value(props: React.PropsWithChildren) {
  return (
    <p className="ml-6 w-12">{props.children}</p>
  )
}