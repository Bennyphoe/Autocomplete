import { RotatingLines } from "react-loader-spinner";

type SpinnerProps = {
  className: string;
  visible: boolean;
  width: string;
  strokeWidth: string;
}

const Spinner: React.FC<SpinnerProps> = ({className, visible, width, strokeWidth}) => {
  return (
    <div className={className}>
       <RotatingLines
        strokeColor="grey"
        strokeWidth={strokeWidth}
        animationDuration="0.75"
        width={width}
        visible={visible}
      />
    </div>
   
  )
}

export default Spinner