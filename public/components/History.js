class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataReturned: 0,
      data: [],
    };
  }
  componentDidMount() {
    fetch(`http://${this.props.host}:${this.props.port}/api/history/${this.props.id_user}`)
      .then((response) => response.json())
      .then((result) => this.setState({ data: result, dataReturned: 1 }))
      .catch((e) => {
        console.log(e);
        this.setState({ data: result });
      });
  }
  render() {
    if (this.state.dataReturned) {
      console.log(this.state.data);
      if (this.state.data.length > 0) {
        let hist = this.state.data.map((d) => (
          <tr>
            <td>{d.model}</td>
            <td>{d.start_timestamp}</td>
            <td>{d.finish_timestamp}</td>
            <td>{d.rating}</td>
            <td>{d.summary}</td>
          </tr>
        ));
        return (
          <table class="table">
            <thead>
              <th scope="col">Модель</th>
              <th scope="col">Начало поездки</th>
              <th scope="col">Окончание поездки</th>
              <th scope="col">Оценка</th>
              <th scope="col">Стоимость</th>
            </thead>
            {hist}
          </table>
        );
      } else return "Ничего не найдено ";
    } else return "Ничего не найдено 1";
  }
}
