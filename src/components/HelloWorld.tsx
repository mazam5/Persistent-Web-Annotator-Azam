
export default function HelloWorld(props: { msg: string }) {

  return (
    <div>
      <h1 className='text-3xl font-mono'>{props.msg}</h1>
    </div>
  )
}
