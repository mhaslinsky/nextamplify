interface FormProps {
  onChangeTitle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeContent: (event: React.ChangeEvent<HTMLInputElement>) => void;
  titleValue: string;
  contentValue: string;
}

export default function Form({ onChangeTitle, onChangeContent, titleValue, contentValue }: FormProps) {
  return (
    <div className='card w-96 bg-base-100 shadow-xl mb-2 '>
      <div className='card-body items-center text-center'>
        <div className='form-control w-full max-w-xs'>
          <input
            type='text'
            placeholder='Title'
            onChange={(e) => {
              onChangeTitle(e);
            }}
            value={titleValue}
            className='input input-bordered input-primary w-full max-w-xs'
          />
        </div>
        <div className='form-control w-full max-w-xs'>
          <input
            type='text'
            placeholder='Content'
            onChange={(e) => onChangeContent(e)}
            value={contentValue}
            className='input input-bordered input-primary w-full max-w-xs'
          />
        </div>
      </div>
    </div>
  );
}
