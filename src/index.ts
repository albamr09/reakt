const createElement = <T>(type: string, props: T, ...children: any[]) => {
	return {
		type,
		props: {
			...props,
			...(children.length > 0 ? children : {}),
		},
	};
};

const ReaKt = {
	createElement,
};

export default ReaKt;
