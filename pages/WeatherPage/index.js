import { View, Text, Button } from 'react-native';
import WeatherChart from '../../components/WeatherChart';
import { useEffect, useState } from 'react';
import { getForecast } from '../../apis/api-weather';
import { DEFAULT_LOCATION, DEFAULT_CITY_NAME } from '../../constants';
import ChangeModal from './ChangeModal';
import { buildCityText, getTemperatureDomain } from '../../utils';
import { styles } from './styles';


const WeatherPage = () => {
  const [data, setData] = useState();
  const [city, setCity] = useState(DEFAULT_CITY_NAME);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [showApparentTemperature, setShowApparentTemperature] = useState(true);
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getForecast(location).then((res) => {
      setData(res.data);
      setShowErrorMessage(false)
      console.log(res.data)
    }).catch((error) => {
      console.log(error)
      setShowErrorMessage(true)
    });
  }, [location])

  const hours = data ? data.hourly.time : [];
  const temperatures = data ? data.hourly.temperature_2m : [];
  const rainProbabilities = data ? data.hourly.precipitation_probability : [];
  const apparentTemperature = data ? data.hourly.apparent_temperature : [];

  const onLocationSelected = (location) => {
    setLocation({lat: location.latitude, long: location.longitude});
    setCity(buildCityText(location))
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {city}
      </Text>
      <View>
        <Button
          title={'Change Location'}
          onPress={() => setModalVisible(!modalVisible)}
        />

        {!showApparentTemperature ? (
          <Button title={'See Apparent Temperature'} onPress={() => setShowApparentTemperature(!showApparentTemperature)} />) : (
          <Button title={'See Temperature'} onPress={() => setShowApparentTemperature(!showApparentTemperature)}/>)
        }
      </View>
      {showErrorMessage ? (
        <Text style={{color: 'red', fontSize: 20, fontWeight: '700'}} >Erro ao carregar gráfico.</Text>
        ) : (
          <View style={{justifyContent: 'center', height: 550, width: '90%'}}>
          {
            !showApparentTemperature ? (
              <WeatherChart 
                yDomain={getTemperatureDomain(temperatures)}
                hours={hours}
                values={temperatures}
                color={{
                  to: '#36d',
                  from: '#d61',
                  line: '#555'
                }}
                title={'Temperatura (oC)'}
              />
            ) : (
              <WeatherChart 
                yDomain={getTemperatureDomain(apparentTemperature)}
                hours={hours}
                values={apparentTemperature}
                color={{
                  to: '#36d',
                  from: '#d61',
                  line: '#555'
                }}
                title={'Sensação Térmica (oC)'}
              />
            )
          }
        
          <WeatherChart 
            yDomain={{ min: 0, max: 100 }}
            hours={hours}
            values={rainProbabilities}
            color={{
              to: '#ddf',
              from: '#14a',
              line: '#555'
            }}
            title={'Chance de preciptação (%)'}
          />
        </View>

      )}
      <ChangeModal 
        visible={modalVisible}
        onCloseRequest={() => setModalVisible(false)}
        onLocationSelected={onLocationSelected}
      />
    </View>
  );
}

export default WeatherPage;
