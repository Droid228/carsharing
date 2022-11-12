class Cars extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataReturned: 0,
      data: [],
      cars: [],
    };
    this.selectHandler = this.selectHandler.bind(this);
  }

  componentDidMount() {
    if (document.getElementById("class") === null) {
      fetch(`http://${this.props.host}:${this.props.port}/api/getcarlist/0`)
        .then((response) => response.json())
        .then((result) => this.setState({ cars: result, dataReturned: 1 }))
        .catch((e) => { 
          console.log(e);
          this.setState({ cars: result });
        });
    }
    fetch(`http://${this.props.host}:${this.props.port}/api/getclasses/`)
      .then((response) => response.json())
      .then((result) => this.setState({ data: result, dataReturned: 1 }))
      .catch((e) => {
        console.log(e);
        this.setState({ data: result });
      });
  }

  selectHandler = () => {
    fetch(
      `http://${this.props.host}:${this.props.port}/api/getcarlist/${
        document.getElementById("class").value
      }`
    )
      .then((response) => response.json())
      .then((result) => this.setState({ cars: result, dataReturned: 1 }))
      .catch((e) => {
        console.log(e);
        this.setState({ cars: result });
      });
  };

  render() {
    if (this.state.dataReturned) {
      const carclass = this.state.data.map((d) => (
        <option key={d.id} value={d.id}>
          {d.class} 
        </option>
      ));
      const cars = this.state.cars.map((d) => (
        <div className="col-xl-4 col-lg-6 col-md-12" key={d.id}>
          <div className="card">
            <img
              className="card-img-top"
              src={"/photos/" + d.photo}
              alt="Card image cap"
            />
            <div className="card-body">
              <h5 className="card-title">{d.model}</h5>
              <div className="card-text">Год выпуска: {d.year}</div>
              <div className="card-text">Класс: {d.class}</div>
              <div className="card-text">Стоимость: {d.cost} р./мин.</div>
              <div className="rating">
                <div className="img">
                  <img
                    className="rating-star"
                    src="/icons/Actions-rating-icon.png"
                  ></img>
                </div>
                <div className="content">{d.rating}</div>
              </div>
              <a
                href={"/rent/" + d.id + "/" + this.props.id_user}
                className="btn btn-primary"
              >
                Арендовать
              </a>
            </div>
          </div>
        </div>
      ));

      return (
        <div>
          <select
            id="class"
            name="class"
            class="form-select"
            onChange={() => this.selectHandler()}
          >
            <option key="0" value="0">
              Все
            </option>
            {carclass}
          </select>
          <div className="row">{cars}</div>
        </div>
      );
    } else return "Ничего не найдено";
  }
}
