window.shader = {
    vertex: [
        'uniform float rtime;',
        'varying vec2 vUv;',
        'attribute float displacement;',

        'void main( void ) {',
        '  vUv = uv;',
        '  vec3 pos;',
        '  if (position.x > position.y) {',
        '    pos = position - normal * displacement * -sin(rtime) * position.x / 15.5;',
        '  } else {',
        '    pos = position + normal * displacement * cos(rtime) * position.z / 11.0;',
        '  }',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);',
        '}'
    ].join('\n'),

    fragment: [
        'uniform float time;',
        'uniform float rtime;',
        'uniform vec2 resolution;',
        'uniform sampler2D texture;',
        'varying vec2 vUv;',

        'float rand(vec2 co) {',
        '  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);',
        '}',

        'void main( void ) {',
            'vec2 position = vUv;',

            'float a = atan( position.y, position.x );',
            'float r = sqrt( dot( position, position ) );',

            'vec2 uv;',
            'uv.x = cos( a ) / r;',
            'uv.y = sin( a ) / r;',
            'uv /= 5.0;',
            'uv += time * 0.15;',

            'float red = abs( sin( position.x * position.y + rtime / 10.5 ) );',
            'float green = abs( sin( position.x * position.y + rtime / 2.5 ) );',
            'float blue = abs( sin( position.x * position.y + rtime / 2.0 ) );',

            'vec3 color = texture2D( texture, uv ).rgb;',

            'color.r *= red * 2.0;',
            'color.g *= green;',
            'color.b *= blue;',

            'gl_FragColor = vec4( color * r * 1.5, 1.0 );',
        '}'
    ].join('\n')
};
